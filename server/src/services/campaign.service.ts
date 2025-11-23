import Campaign from '../models/Campaign';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export class CampaignService {
    async createCampaign(data: any) {
        try {
            const campaign = await Campaign.create(data);
            logger.info(`Campaign created: ${campaign.id}`);
            return campaign;
        } catch (error: any) {
            logger.error(`Error creating campaign: ${error.message}`);
            throw new AppError('Failed to create campaign', 500);
        }
    }

    async getCampaigns(limit: number, offset: number) {
        const campaigns = await Campaign.find()
            .sort({ updatedAt: -1 })
            .skip(offset)
            .limit(limit);

        const total = await Campaign.countDocuments();

        return {
            campaigns,
            total,
        };
    }

    async getCampaign(id: string) {
        const campaign = await Campaign.findById(id);
        if (!campaign) throw new AppError('Campaign not found', 404);
        return campaign;
    }

    async updateCampaign(id: string, data: any) {
        const campaign = await Campaign.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        );

        if (!campaign) throw new AppError('Campaign not found', 404);
        return campaign;
    }

    async deleteCampaign(id: string) {
        const result = await Campaign.findByIdAndDelete(id);
        if (!result) throw new AppError('Campaign not found', 404);
        return { ok: true };
    }
}
