import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { z } from 'zod';

const analyticsService = new AnalyticsService();

const identifySchema = z.object({
    user_id: z.string().min(1),
    traits: z.any().optional(),
});

const trackSchema = z.object({
    user_id: z.string().min(1),
    event: z.string().min(1),
    properties: z.any().optional(),
});

export class AnalyticsController {
    async identify(req: Request, res: Response, next: NextFunction) {
        try {
            const { user_id, traits } = identifySchema.parse(req.body);
            const result = await analyticsService.identify(user_id, traits);
            res.json({ ok: true, user: result });
        } catch (error) {
            next(error);
        }
    }

    async track(req: Request, res: Response, next: NextFunction) {
        try {
            const { user_id, event, properties } = trackSchema.parse(req.body);
            const result = await analyticsService.track(user_id, event, properties);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}
