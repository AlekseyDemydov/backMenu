import express from "express";

import { checkAuth } from "../middleware/checkAuth.js";
import { toggleLike } from "../controllers/ProductController.js";


const router = express.Router();

router.patch(
  "/categories/:categoryId/subcategories/:subcategoryId/products/:productId/like",
  checkAuth,
  toggleLike
);

export default router;
