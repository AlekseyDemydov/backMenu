import express from "express";
import {
  getAll,
  addCategory,
  addSubcategory,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/ProductController.js";

const router = express.Router();

// Отримати всі категорії
router.get("/", getAll);

// Додати нову категорію
router.post("/category", addCategory);

// Додати підкатегорію до категорії
router.post("/category/:categoryId/subcategory", addSubcategory);

// Додати продукт до підкатегорії
router.post("/category/:categoryId/subcategory/:subcategoryId/product", addProduct);

// Оновити продукт
router.put("/category/:categoryId/subcategory/:subcategoryId/product/:productId", updateProduct);

// Видалити продукт
router.delete('/category/:categoryId/subcategory/:subcategoryId/product/:productId', deleteProduct);

export default router;
