import { Router } from 'express';
import { ProductController } from '../controllers/product-controller.js';
import { upload } from '../common/uploads.js';
import { authMiddleware } from '../common/middlewares.js';
import * as InquiryController from '../controllers/inquiry-controller.js';

const router = Router();
const productController = new ProductController();

router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  productController.createProduct,
);

router.get('/', productController.getProducts);
router.patch('/:productId', productController.updateProduct);
router.get('/:productId', productController.getProductById);
router.delete('/:productId', productController.deleteProduct);

/* Inquiry routes */
/****************************************/
router.get('/:productId/inquiries', InquiryController.getInquiriesForProduct);
router.post(
  '/:productId/inquiries',
  authMiddleware,
  InquiryController.createInquiryForProduct,
);
/****************************************/

export default router;
