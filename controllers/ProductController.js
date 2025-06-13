import ProductModel from "../models/Product.js";
import { v4 as uuidv4 } from "uuid"; // Бібліотека для генерації унікальних ID

// Отримати всі категорії з підкатегоріями та товарами
export const getAll = async (req, res) => {
  try {
    const categories = await ProductModel.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Не вдалося отримати дані" });
  }
};

// Додати нову категорію
export const addCategory = async (req, res) => {
  try {
    const doc = new ProductModel({
      _id: uuidv4(),
      category: req.body.category,
      subcategories: [],
    });

    const category = await doc.save();
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Не вдалося створити категорію" });
  }
};

// Додати підкатегорію до конкретної категорії
export const addSubcategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { subcategory } = req.body;

    const updatedCategory = await ProductModel.findByIdAndUpdate(
      categoryId,
      {
        $push: {
          subcategories: {
            _id: uuidv4(),
            subcategory,
            items: [],
          },
        },
      },
      { new: true }
    );

    res.json(updatedCategory);
  } catch (err) {
    res.status(500).json({ message: "Не вдалося додати підкатегорію" });
  }
};

// Додати продукт до конкретної підкатегорії
export const addProduct = async (req, res) => {
  try {
    const { categoryId, subcategoryId } = req.params;

    const productData = {
      ...req.body,
      _id: uuidv4(),
    };

    // Переконайся, що обов'язкові поля є
    if (!productData.title || !productData.price || !productData.src) {
      return res.status(400).json({ message: "Відсутні обов'язкові поля продукту" });
    }

    const category = await ProductModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Категорія не знайдена" });
    }

    const subcategory = category.subcategories.id(subcategoryId);
    if (!subcategory) {
      return res.status(404).json({ message: "Підкатегорія не знайдена" });
    }

    subcategory.items.push(productData);
    await category.save();

    res.status(201).json({ message: "Продукт додано", product: productData });
  } catch (err) {
    console.error("Error in addProduct:", err);
    res.status(500).json({ message: "Не вдалося додати продукт", error: err.message });
  }
};

// Оновити продукт
export const updateProduct = async (req, res) => {
  try {
    const { categoryId, subcategoryId, productId } = req.params;
    const productData = req.body;

    const category = await ProductModel.findById(categoryId);
    if (!category) return res.status(404).json({ message: "Категорія не знайдена" });

    const subcategory = category.subcategories.id(subcategoryId);
    if (!subcategory) return res.status(404).json({ message: "Підкатегорія не знайдена" });

    const product = subcategory.items.id(productId);
    if (!product) return res.status(404).json({ message: "Продукт не знайдено" });

    if (
      productData.categoryId &&
      productData.subcategoryId &&
      categoryId === productData.categoryId &&
      subcategoryId === productData.subcategoryId
    ) {
      // Оновлюємо поля продукту через set()
      product.set(productData);

      // Явно оновлюємо updatedAt
      product.updatedAt = new Date();

      // Потрібно явно сказати Mongoose, що поле вкладеного масиву оновлено
      category.markModified("subcategories");

      await category.save();

      return res.json(product);
    }

    // Якщо змінюємо категорію чи підкатегорію (переміщаємо продукт)
    subcategory.items.id(productId).remove();

    const newCategory = await ProductModel.findById(productData.categoryId);
    if (!newCategory) return res.status(404).json({ message: "Нова категорія не знайдена" });

    const newSubcategory = newCategory.subcategories.id(productData.subcategoryId);
    if (!newSubcategory) return res.status(404).json({ message: "Нова підкатегорія не знайдена" });

    productData.updatedAt = new Date();
    newSubcategory.items.push(productData);

    category.markModified("subcategories");
    newCategory.markModified("subcategories");

    await category.save();
    await newCategory.save();

    res.json(productData);
  } catch (err) {
    console.error("Помилка при оновленні продукту:", err);
    res.status(500).json({ message: "Не вдалося оновити продукт" });
  }
};




// Видалити продукт
export const deleteProduct = async (req, res) => {
  try {
    const { categoryId, subcategoryId, productId } = req.params;

    const category = await ProductModel.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Категорія не знайдена" });

    const subcategory = category.subcategories.id(subcategoryId);
    if (!subcategory)
      return res.status(404).json({ message: "Підкатегорія не знайдена" });

    const product = subcategory.items.id(productId);
    if (!product)
      return res.status(404).json({ message: "Продукт не знайдено" });

    product.deleteOne();
    category.markModified("subcategories");
    await category.save();

    res.json({ message: "Продукт видалено" });
  } catch (err) {
    console.error("Помилка видалення:", err);
    res.status(500).json({ message: "Не вдалося видалити продукт" });
  }
};
export const toggleLike = async (req, res) => {
  try {
    const { categoryId, subcategoryId, productId } = req.params;
    const userId = req.userId; // має бути із middleware авторизації

    if (!userId) {
      return res.status(401).json({ message: "Неавторизований" });
    }

    const category = await ProductModel.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Категорія не знайдена" });

    const subcategory = category.subcategories.id(subcategoryId);
    if (!subcategory)
      return res.status(404).json({ message: "Підкатегорія не знайдена" });

    const product = subcategory.items.id(productId);
    if (!product)
      return res.status(404).json({ message: "Продукт не знайдено" });

    const userIdStr = userId.toString();
    const liked = product.likes.some((id) => id.toString() === userIdStr);

    if (liked) {
      product.likes = product.likes.filter((id) => id.toString() !== userIdStr);
    } else {
      product.likes.push(userIdStr);
    }

    category.markModified("subcategories");
    await category.save();

    res.json({
      liked: !liked,
      likes: product.likes,
      likesCount: product.likes.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка лайку" });
  }
};


// Отримати коментарі продукту
export const getComments = async (req, res) => {
  try {
    const { categoryId, subcategoryId, productId } = req.params;

    const category = await ProductModel.findById(categoryId);
    if (!category) return res.status(404).json({ message: "Категорія не знайдена" });

    const subcategory = category.subcategories.id(subcategoryId);
    if (!subcategory) return res.status(404).json({ message: "Підкатегорія не знайдена" });

    const product = subcategory.items.id(productId);
    if (!product) return res.status(404).json({ message: "Продукт не знайдено" });

    res.json(product.comments || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Не вдалося отримати коментарі" });
  }
};

// Додати коментар до продукту
export const addComment = async (req, res) => {
  console.log("BODY:", req.body);
  try {
    const { categoryId, subcategoryId, productId } = req.params;
    const { userId, fullName, text } = req.body;

    if (!text || !userId || !fullName) {
      return res.status(400).json({ message: "Необхідні поля відсутні" });
    }

    const category = await ProductModel.findById(categoryId);
    if (!category) return res.status(404).json({ message: "Категорія не знайдена" });

    const subcategory = category.subcategories.id(subcategoryId);
    if (!subcategory) return res.status(404).json({ message: "Підкатегорія не знайдена" });

    const product = subcategory.items.id(productId);
    if (!product) return res.status(404).json({ message: "Продукт не знайдено" });

    const newComment = {
      _id: uuidv4(),
      userId,
      fullName,
      text,
      createdAt: new Date(),
    };

    product.comments = product.comments || [];
    product.comments.push(newComment);

    category.markModified("subcategories");
    await category.save();

    res.status(201).json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Не вдалося додати коментар" });
  }
};