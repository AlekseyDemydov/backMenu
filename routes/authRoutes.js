import express from 'express';
import { createUser, loginUser, getMe } from '../controllers/UserController.js';
import { checkAuth } from '../middleware/checkAuth.js';
import { loginValidation, registerValidation } from '../validations/loginValidation.js';
import handleValidationErrors from '../middleware/handleValidationErrors.js';
import Order from '../models/Order.js'; // ← обов’язково

const router = express.Router();

router.post('/register', registerValidation, handleValidationErrors, createUser);
router.post('/login', loginValidation, handleValidationErrors, loginUser);
router.get('/me', checkAuth, getMe);

router.post('/orders', checkAuth, async (req, res) => {
  const { products, total, phone, fullName } = req.body;
  const userId = req.userId;

  try {
    const order = await Order.create({
      userId,
      fullName, // <-- беремо напряму з тіла
      products,
      total,
      phone,
    });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Не вдалося створити замовлення' });
  }
});

export default router;
