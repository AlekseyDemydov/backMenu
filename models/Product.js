import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid"; // Додаємо uuid для генерації унікальних ID

const { Schema } = mongoose;

// Схема для окремого продукту
const ProductSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    price: {
      type: String,
      required: [true, "Price is required"],
    },
    price2: {
      type: String,
    },
    src: {
      type: String,
      required: [true, "Image source is required"],
    },
    text: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    isNewProduct: {
      type: Boolean,
      default: false, // за замовчуванням товар не новий
    },
    zvd: {
      type: String,
      default: "",
    },
    _id: {
      type: String,
      default: uuidv4, // Автоматичне генерування унікального ID
    },
    likes: {
      type: [String], // масив ID користувачів
      default: [],
    },
    comments: {
  type: [
    new Schema(
      {
        _id: {
          type: String,
          required: true,
        },
        userId: { type: String, required: true },
        fullName: { type: String, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
      { _id: false } // 👈 ось це критично!
    ),
  ],
  default: [],
}
  },
  {
    timestamps: true, // Додаємо час створення та оновлення
  }
);

// Схема для підкатегорій
const SubcategorySchema = new Schema(
  {
    subcategory: {
      type: String,
      required: [true, "Subcategory name is required"],
    },
    items: [ProductSchema], // Масив продуктів у підкатегорії
    _id: {
      type: String,
      default: uuidv4, // Автоматичне генерування унікального ID для підкатегорій
    },
  },
  {
    timestamps: true, // Додаємо час створення та оновлення підкатегорії
  }
);

// Схема для категорій
const CategorySchema = new Schema(
  {
    category: {
      type: String,
      required: [true, "Category name is required"],
    },
    subcategories: [SubcategorySchema], // Масив підкатегорій
    _id: {
      type: String,
      default: uuidv4, // Автоматичне генерування унікального ID для категорій
    },
  },
  {
    timestamps: true, // Додаємо час створення та оновлення категорії
  }
);

const ProductModel = mongoose.model("Category", CategorySchema);

export default ProductModel;
