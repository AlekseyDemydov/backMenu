import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import multer from "multer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
// import http from 'http';

// Імпортуємо моделі користувачів, продуктів і замовлень
import { Product } from "./models/index.js";

// Імпортуємо контролери для роботи з роутами
import productRoutes from "./routes/productRoutes.js";

// Налаштовуємо змінні середовища
dotenv.config();

// Підключаємось до бази даних MongoDB
// mongoose.connect("mongodb+srv://agdemidof:fAgjjNapYHgeBnUI@menu.pzuhz.mongodb.net/Menu?retryWrites=true&w=majority")
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

app.set('ProductModel', Product);



// Маршрути для продуктів
app.use("/api/products", productRoutes);

// Маршрут, що викликається, якщо запит не знайдено
app.use((req, res, next) => {
  res.status(404).json({ message: "Not Found" });
});

// Middleware для обробки помилок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});
// const PORT = process.env.PORT || 4444;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// http.createServer(app).listen(process.env.PORT, process.env.HOST, () => {
//   console.log(`Server is running on port ${process.env.PORT}`);
// });
// Експортуємо для Vercel
export default app;
