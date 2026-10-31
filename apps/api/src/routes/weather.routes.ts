import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';

const router = Router();

// In-memory weather cache: key = `lat,lon` -> { data, timestamp }
const weatherCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

router.get('/forecast', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 28.6139;
    const lon = parseFloat(req.query.lon as string) || 77.2090;

    const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
    const now = Date.now();
    const cached = weatherCache.get(cacheKey);

    if (cached && (now - cached.timestamp) < CACHE_TTL_MS) {
      const ageSeconds = Math.round((now - cached.timestamp) / 1000);
      res.json({
        ...cached.data,
        is_cached: true,
        age_seconds: ageSeconds,
        is_stale: ageSeconds > 10800 // > 3 hours
      });
      return;
    }

    // Call Open-Meteo API (verified terms: CC-BY 4.0, attribution required, < 10,000 calls/day)
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration,shortwave_radiation_sum&timezone=auto`;
      const response = await axios.get(url, { timeout: 4000 });
      const current = response.data.current || {};
      const daily = response.data.daily || {};

      const weatherResult = {
        attribution: 'Weather data provided by Open-Meteo.com under CC-BY 4.0',
        license: 'https://open-meteo.com/en/terms',
        status: 'live',
        timestamp: new Date().toISOString(),
        temperature: current.temperature_2m ?? 26.0,
        humidity: current.relative_humidity_2m ?? 50.0,
        precipitation: current.precipitation ?? 0.0,
        wind_speed: current.wind_speed_10m ? (current.wind_speed_10m / 3.6) : 2.0, // km/h to m/s
        daily_max_temp: daily.temperature_2m_max?.[0] ?? 32.0,
        daily_min_temp: daily.temperature_2m_min?.[0] ?? 20.0,
        daily_precip_forecast_mm: daily.precipitation_sum?.[0] ?? 0.0,
        daily_et0_openmeteo_mm: daily.et0_fao_evapotranspiration?.[0] ?? 4.2,
        shortwave_radiation: daily.shortwave_radiation_sum?.[0] ?? 18.0,
        age_seconds: 0,
        is_stale: false,
        is_cached: false
      };

      weatherCache.set(cacheKey, { data: weatherResult, timestamp: now });
      res.json(weatherResult);
    } catch (apiErr: any) {
      console.warn('[OpenMeteo] External API failed or timed out:', apiErr.message);

      // If cached data exists even if older, return it marked stale
      if (cached) {
        const ageSeconds = Math.round((now - cached.timestamp) / 1000);
        res.json({
          ...cached.data,
          status: 'stale_fallback',
          is_stale: true,
          age_seconds: ageSeconds,
          warning: 'Live weather service unreachable. Using last known cached weather snapshot.'
        });
        return;
      }

      // Safe conservative synthetic fallback clearly labelled
      res.json({
        attribution: 'Fallback agricultural climate estimates (Open-Meteo offline)',
        status: 'degraded_fallback',
        timestamp: new Date().toISOString(),
        temperature: 25.0,
        humidity: 50.0,
        precipitation: 0.0,
        wind_speed: 2.0,
        daily_max_temp: 30.0,
        daily_min_temp: 20.0,
        daily_precip_forecast_mm: 0.0,
        daily_et0_openmeteo_mm: 4.0,
        shortwave_radiation: 17.0,
        age_seconds: 3600,
        is_stale: true,
        is_cached: false,
        warning: 'Weather API offline. Default agronomic values applied.'
      });
    }
  } catch (err) {
    next(err);
  }
});

export default router;

