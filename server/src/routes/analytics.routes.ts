import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';

const router = Router();
const controller = new AnalyticsController();

router.post('/identify', controller.identify.bind(controller));
router.post('/track', controller.track.bind(controller));

export default router;
