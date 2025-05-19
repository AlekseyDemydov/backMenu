import express from "express";
import { checkAuth } from "../middleware/checkAuth.js";
import { getComments, addComment } from "../controllers/ProductController.js";

const router = express.Router();

// Отримати всі коментарі для продукту
router.get(
  "/categories/:categoryId/subcategories/:subcategoryId/products/:productId/comments",
  checkAuth,
  getComments
);

// Додати коментар до продукту
router.post(
  "/categories/:categoryId/subcategories/:subcategoryId/products/:productId/comments",
  checkAuth,
  addComment
);

export default router;
