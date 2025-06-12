import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import multer from "multer";
import dotenv from "dotenv";
// import fs from "fs"; ❌
import path from "path";
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from "cloudinary";
// import http from 'http';

// Імпортуємо моделі користувачів, продуктів і замовлень
import { Product } from "./models/index.js";

// Імпортуємо контролери для роботи з роутами
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import commentRoutes from "./routes/CommentRoutes.js";

dotenv.config();

// Підключаємось до бази даних MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ DB connected"))
  .catch((err) => console.error("DB connection error", err));

// Створюємо екземпляр додатку Express
const app = express();

// Налаштовуємо CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// Використовуємо middlewares
app.use(cors());
app.use(express.json());
app.use(helmet());
// app.use("/uploads", express.static("uploads")); ❌ не потрібно, якщо не використовуємо локальне сховище

// ❌ Коментуємо все що пов’язане з локальними файлами
/*
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

app.post("/upload", upload.single("image"), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});
*/

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Використовуємо multer.memoryStorage
const upload = multer({ storage: multer.memoryStorage() });

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "uploads" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary error:", error);
          return res.status(500).json({ error: "Upload failed" });
        }
        res.json({ url: result.secure_url });
      }
    );
    stream.end(req.file.buffer);
  } catch (err) {
    console.error("Upload route error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Додаємо моделі до контексту
app.set('ProductModel', Product);

// Маршрути
app.use("/api/products", productRoutes);
app.use("/auth", authRoutes);
app.use("/api/products", likeRoutes);
app.use("/api", commentRoutes);

// 404
app.use((req, res, next) => {
  res.status(404).json({ message: "Not Found" });
});

// Middleware для помилок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});


// const PORT =  4444;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


// Експортуємо для Vercel
export default app;
