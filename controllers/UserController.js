import User from '../models/User.js';

export const createUser = async (req, res) => {
  try {
    const newUser = new User(req.body); // assuming req.body contains the necessary user data
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Помилка при створенні користувача:', error);
    res.status(500).json({
      message: 'Не вдалося створити користувача',
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.find();
    res.json(user);
  } catch (error) {
    console.error('Помилка при отриманні відгуків:', error);
    res.status(500).json({
      message: 'Не вдалося отримати список відгуків',
    });
  }
};