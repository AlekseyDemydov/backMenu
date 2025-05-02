import express from 'express';
import { createUser, loginUser, getMe  } from '../controllers/UserController.js';
import { checkAuth } from '../middleware/checkAuth.js';
import { loginValidation, registerValidation } from '../validations/loginValidation.js';
import handleValidationErrors from '../middleware/handleValidationErrors.js';



const router = express.Router();

router.post('/register', registerValidation, handleValidationErrors, createUser);
router.post('/login', loginValidation, handleValidationErrors, loginUser);
router.get('/me', checkAuth, getMe);

export default router;
