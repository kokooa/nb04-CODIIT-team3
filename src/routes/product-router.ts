import { Router } from 'express';
import { ProductController } from '../controllers/product-controller.js';
import { InquiryController } from '../controllers/inquiry-controller.js';
import { upload } from '../common/uploads.js';
import { authMiddleware } from '../common/middlewares.js';

const router = Router();
const productController = new ProductController();
const inquiryController = new InquiryController();

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

router.get('/:productId/inquiries', inquiryController.getInquiries);

export default router;
