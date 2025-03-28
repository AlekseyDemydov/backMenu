// import mongoose from "mongoose";

// const { Schema } = mongoose;


// const ProductSchema = new Schema({
//   name: {
//     type: String,
//     required: [true, "Name is required"],
//     trim: true,
//   },
//   description: {
//     type:  String,
  
//   },
//   text: {
//     type:  String,
  
//   },
//   price: {
//     type: Number,
//     required: [true, "Price is required"],
//     min: [0, "Price cannot be negative"],
//   },
//   imageUrl: {
//     type: String,
//     trim: true,
//   },
// }, {
//   timestamps: true,
// });

// const Product = mongoose.model("Product", ProductSchema);

// export default Product;

import mongoose from "mongoose";

const { Schema } = mongoose;

// Схема для окремого продукту
const ProductSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  price: {
    type: String,
    required: [true, "Price is required"],
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
}, {
  timestamps: true,  // Додаємо час створення та оновлення
});

// Схема для підкатегорій
const SubcategorySchema = new Schema({
  subcategory: {
    type: String,
    required: [true, "Subcategory name is required"],
  },
  items: [ProductSchema], // Масив продуктів у підкатегорії
}, {
  timestamps: true,  // Додаємо час створення та оновлення підкатегорії
});

// Схема для категорій
const CategorySchema = new Schema({
  category: {
    type: String,
    required: [true, "Category name is required"],
  },
  subcategories: [SubcategorySchema], // Масив підкатегорій
}, {
  timestamps: true,  // Додаємо час створення та оновлення категорії
});

const Product = mongoose.model("Category", CategorySchema);

export default Product;
