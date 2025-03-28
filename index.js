import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import multer from "multer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

// Імпортуємо моделі користувачів, продуктів і замовлень
import { User, Product } from "./models/index.js";

// Імпортуємо контролери для роботи з роутами
import {
  createProduct,
  getAllProducts,
  getOneProduct,
  deleteProduct,
  updateProduct,
  getMe,
  createUser,
} from "./controllers/index.js";

// Налаштовуємо змінні середовища
dotenv.config();

// Підключаємось до бази даних MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("DB connected"))
  .catch((err) => console.error("DB connection error", err));

// Створюємо екземпляр додатку Express
const app = express();

// const allowedOrigin = "https://cloud-crafters.com.ua" || "http://localhost:3000";

// Налаштовуємо CORS (можна залишити цей код, але Vercel автоматично дозволяє CORS)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// Використовуємо middlewares для Express
app.use(cors()); // Для дозволу CORS
app.use(express.json()); // Для роботи з JSON даними
app.use(helmet()); // Для підвищення безпеки
app.use("/uploads", express.static("uploads"));

// Переконайтеся, що директорія 'uploads' існує
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Налаштовуємо сховище для завантажуваних файлів за допомогою multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Маршрут для завантаження файлів
app.post("/upload", upload.single("image"), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

// Додаємо моделі до контексту додатку Express
app.set('UserModel', User);
app.set('ProductModel', Product);

// Маршрути для користувачів
app.get("/me", getMe);
app.post("/me", createUser);

// Маршрути для продуктів
app.get("/products", getAllProducts);
app.get("/products/:id", getOneProduct);
app.post("/products", createProduct);
app.delete("/products/:id", deleteProduct);
app.put("/products/:id", updateProduct);

// Маршрут, що викликається, якщо запит не знайдено
app.use((req, res, next) => {
  res.status(404).json({ message: "Not Found" });
});

// Middleware для обробки помилок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// Експортуємо для Vercel
export default app;
