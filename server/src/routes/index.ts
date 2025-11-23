import { Router } from 'express';
import campaignRoutes from './campaign.routes';
import analyticsRoutes from './analytics.routes';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes (or client-auth routes)
router.use('/analytics', requireAuth, analyticsRoutes); // SDK endpoints

// Admin routes
router.use('/admin/campaigns', requireAdmin, campaignRoutes);

// Legacy SDK compatibility (if needed, map root /campaigns to client auth)
router.use('/campaigns', requireAuth, campaignRoutes);

export default router;
