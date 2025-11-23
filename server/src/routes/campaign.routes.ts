import { Router } from 'express';
import { CampaignController } from '../controllers/campaign.controller';

const router = Router();
const controller = new CampaignController();

router.post('/', controller.create.bind(controller));
router.get('/', controller.getAll.bind(controller));
router.get('/:id', controller.getOne.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export default router;
