import { Router } from 'express';
import multer from 'multer';
import { initOrder, handlePaymentSuccess, uploadAssets, getOrderStatus } from '../controllers/order.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/init', initOrder);
router.post('/payment-success', handlePaymentSuccess);
router.post('/upload', upload.array('files', 5), uploadAssets);
router.get('/:id', getOrderStatus);

export default router;
