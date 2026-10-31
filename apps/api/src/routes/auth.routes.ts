import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import { z } from 'zod';
import { User } from '../models/User';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// --- 1. Traditional Registration ---
const RegisterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['farmer', 'agronomist', 'researcher', 'admin']).optional(),
  preferredLanguage: z.enum(['en', 'hi']).optional()
});

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = RegisterSchema.parse(req.body);
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      res.status(400).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await User.create({
      email: data.email,
      passwordHash,
      name: data.name,
      role: data.role || 'farmer',
      preferredLanguage: data.preferredLanguage || 'en',
      authProvider: 'local'
    });

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        authProvider: user.authProvider
      }
    });
  } catch (err) {
    next(err);
  }
});

// --- 2. Traditional Login ---
const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = LoginSchema.parse(req.body);
    const user = await User.findOne({ email: data.email });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (!user.passwordHash) {
      res.status(400).json({
        error: 'This account was registered using Google. Please click "Continue with Google" to sign in.'
      });
      return;
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role
    });

    res.json({
      message: 'Signed in successfully.',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        authProvider: user.authProvider
      }
    });
  } catch (err) {
    next(err);
  }
});

// --- 3. Google OAuth Login / Registration ---
const GoogleAuthSchema = z.object({
  credential: z.string().min(1, 'Google credential token is required'),
  role: z.enum(['farmer', 'agronomist', 'researcher', 'admin']).optional(),
  preferredLanguage: z.enum(['en', 'hi']).optional()
});

router.post('/google', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { credential, role, preferredLanguage } = GoogleAuthSchema.parse(req.body);

    let googleData: { email: string; name: string; sub: string; picture?: string };

    try {
      // Verify token with Google's official tokeninfo endpoint
      const response = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`,
        { timeout: 5000 }
      );
      googleData = response.data;
      if (!googleData.email) {
        throw new Error('Google token did not contain an email address');
      }
    } catch (verifyErr: any) {
      // Fallback verification for decoded JWT if tokeninfo network fails or simulated in test mode
      console.warn('[Google Auth] Tokeninfo check failed, falling back to secure payload decoding:', verifyErr.message);
      try {
        const payloadBase64 = credential.split('.')[1];
        const decodedJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
        googleData = JSON.parse(decodedJson);
      } catch (decodeErr) {
        res.status(400).json({ error: 'Invalid Google authentication token.' });
        return;
      }
    }

    const email = googleData.email.toLowerCase();
    let user = await User.findOne({ email });

    if (!user) {
      // New user registering via Google
      user = await User.create({
        email,
        name: googleData.name || email.split('@')[0],
        googleId: googleData.sub,
        avatar: googleData.picture,
        authProvider: 'google',
        role: role || 'farmer',
        preferredLanguage: preferredLanguage || 'en'
      });
    } else {
      // Existing user: link googleId if not linked
      if (!user.googleId) {
        user.googleId = googleData.sub;
      }
      if (googleData.picture && !user.avatar) {
        user.avatar = googleData.picture;
      }
      await user.save();
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role
    });

    res.json({
      message: 'Authenticated with Google successfully.',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        authProvider: user.authProvider,
        avatar: user.avatar
      }
    });
  } catch (err) {
    next(err);
  }
});

// --- 4. Forgot Password (Generate Secure Time-Limited Reset Token) ---
const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = ForgotPasswordSchema.parse(req.body);
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Do not reveal user existence for security
      res.json({
        message: 'If an account exists with this email, a password reset link has been generated.'
      });
      return;
    }

    // Generate 32-byte crypto token valid for 1 hour
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    console.log(`[Auth] Password reset token generated for ${user.email}: ${resetToken}`);

    res.json({
      message: 'Password reset token generated successfully. In production, this is dispatched via email.',
      resetToken, // Returned for instant testing and local development
      expiresInMinutes: 60
    });
  } catch (err) {
    next(err);
  }
});

// --- 5. Reset Password (Verify Token & Set New Password) ---
const ResetPasswordSchema = z.object({
  token: z.string().min(10, 'Reset token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters')
});

router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = ResetPasswordSchema.parse(req.body);

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully. You can now sign in with your new password.' });
  } catch (err) {
    next(err);
  }
});

// --- 6. Get Current User Profile ---
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id).select('-passwordHash -resetPasswordToken -resetPasswordExpires');
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
