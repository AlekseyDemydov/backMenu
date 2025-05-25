import dotenv from "dotenv";
dotenv.config();
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const createUser = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body; // додано phone

    // Перевірка наявності користувача
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Користувач з таким email вже існує" });
    }

    // Хешування пароля
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Створення нового користувача
    const newUser = new User({ fullName, email, passwordHash, phone }); // phone передаємо
    const savedUser = await newUser.save();

    // Генерація токена (опційно)
    const token = jwt.sign({ id: savedUser._id }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      user: {
        _id: savedUser._id,
        fullName: savedUser.fullName,
        email: savedUser.email,
        phone: savedUser.phone,
      },
      token,
    });
  } catch (error) {
    console.error("Помилка при створенні користувача:", error);
    res.status(500).json({ message: "Не вдалося створити користувача" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Пошук користувача
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    // Перевірка пароля
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Невірний пароль" });
    }

    // Генерація токена
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30d" });

    res.json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Помилка при логіні:", error);
    res.status(500).json({ message: "Не вдалося увійти" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Помилка при отриманні користувача" });
  }
};
