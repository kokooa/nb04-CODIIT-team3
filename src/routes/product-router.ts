import { Router } from "express";
// import { ProductController } from "../controllers/product-controller.js";
import { InquiryController } from "../controllers/inquiry-controller.js";

const router = Router();

// const productController = new ProductController();
const inquiryController = new InquiryController();

// router.post("/api/products", productController.createProduct);
// router.get("/api/products", productController.getProducts);
// router.patch("/api/products/:productId", productController.updateProduct);
// router.get("/api/products/:productId", productController.getProductById);
// router.delete("/api/products/:productId", productController.deleteProduct);

// TODO: 문의 기능도 추가 많이 되어야함.
// router.post("/api/products/:productId/inquiries", inquiryController.createInquiry);
router.get("/api/products/:productId/inquiries", inquiryController.getInquiries);

export default router;