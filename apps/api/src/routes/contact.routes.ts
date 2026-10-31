import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ContactMessage } from '../models/ContactMessage';

const router = Router();

const ContactSchema = z.object({
  name: z.string().min(2, 'Full Name must be at least 2 characters'),
  email: z.string().email('Please provide a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = ContactSchema.parse(req.body);
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';

    const contactDoc = await ContactMessage.create({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      ipAddress,
      status: 'new'
    });

    console.log(`[Contact] New inquiry from ${data.name} (${data.email}): "${data.subject}"`);

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Our agricultural intelligence team has received your message and will respond shortly.',
      inquiryId: contactDoc._id,
      timestamp: contactDoc.createdAt
    });
  } catch (err) {
    next(err);
  }
});

export default router;

