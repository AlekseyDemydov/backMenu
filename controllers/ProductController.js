import Product from '../models/Product.js'; // Імпортуємо модель Product
import { v4 as uuidv4 } from "uuid";  // Бібліотека для генерації унікальних ID
// Контролер для створення нового продукту


export const createProduct = async (req, res) => {
  try {
    const { category, subcategory, title, price, src, text, description } = req.body;

    // Знайдемо категорію, якщо вона існує
    let categoryDoc = await Product.findOne({ "category": category });

    if (!categoryDoc) {
      // Якщо категорія не знайдена, створимо нову категорію
      categoryDoc = new Product({
        category,
        subcategories: []
      });
    }

    // Знайдемо підкатегорію в межах категорії
    let subcategoryDoc = categoryDoc.subcategories.find(
      (sub) => sub.subcategory === subcategory
    );

    if (!subcategoryDoc) {
      // Якщо підкатегорія не знайдена, створимо нову підкатегорію
      subcategoryDoc = {
        subcategory,
        items: []
      };
      // Додаємо нову підкатегорію до категорії
      categoryDoc.subcategories.push(subcategoryDoc);
    }

    // Створимо новий продукт з унікальним id
    const newProduct = {
      id: uuidv4(), // Генерація унікального ID для продукту
      title,
      price,
      src,
      text,
      description,
    };

    // Додаємо продукт до підкатегорії
    subcategoryDoc.items.push(newProduct);

    // Зберігаємо зміни в базі даних (якщо категорія була новою, її також збережемо)
    await categoryDoc.save();

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Помилка при створенні продукту:', error);
    res.status(500).json({
      message: 'Не вдалося створити продукт',
    });
  }
};

// Контролер для отримання всіх продуктів
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error('Помилка при отриманні продуктів:', error);
    res.status(500).json({
      message: 'Не вдалося отримати список продуктів',
    });
  }
};

// Контролер для отримання одного продукту за його ідентифікатором
export const getOneProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Продукт не знайдено' });
    }

    res.json(product);
  } catch (error) {
    console.error('Помилка при отриманні продукту:', error);
    res.status(500).json({
      message: 'Не вдалося отримати продукт',
    });
  }
};

// Контролер для видалення продукту
export const deleteProduct = async (req, res) => {
  try {
      const productId = req.params.id;
      const deletedProduct = await Product.findByIdAndDelete(productId);
      if (!deletedProduct) {
          return res.status(404).json({ message: 'Продукт не знайдено' });
      }
      res.json({ message: 'Продукт успішно видалено' });
  } catch (error) {
      console.error('Помилка при видаленні продукту:', error);
      res.status(500).json({ message: 'Не вдалося видалити продукт' });
  }
};

// Контролер для оновлення продукту
export const updateProduct = async (req, res) => {
  try {
      const productId = req.params.id;
      const updatedProduct = await Product.findByIdAndUpdate(productId, req.body, { new: true });
      if (!updatedProduct) {
          return res.status(404).json({ message: 'Продукт не знайдено' });
      }
      res.json(updatedProduct);
  } catch (error) {
      console.error('Помилка при оновленні продукту:', error);
      res.status(500).json({ message: 'Не вдалося оновити продукт' });
  }
};