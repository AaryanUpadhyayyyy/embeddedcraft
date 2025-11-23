import { Request, Response, NextFunction } from 'express';
import { CampaignService } from '../services/campaign.service';
import { z } from 'zod';

const campaignService = new CampaignService();

// Validation Schemas
const createCampaignSchema = z.object({
    name: z.string().min(1),
    status: z.enum(['active', 'paused', 'draft']).optional(),
    type: z.string().optional(),
    trigger: z.string().optional(),
    rules: z.any().optional(),
    config: z.any().optional(),
});

export class CampaignController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const validated = createCampaignSchema.parse(req.body);
            const campaign = await campaignService.createCampaign(validated);
            res.status(201).json(campaign);
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = parseInt(req.query.offset as string) || 0;
            const result = await campaignService.getCampaigns(limit, offset);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const campaign = await campaignService.getCampaign(req.params.id);
            res.json(campaign);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const campaign = await campaignService.updateCampaign(req.params.id, req.body);
            res.json(campaign);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await campaignService.deleteCampaign(req.params.id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}
