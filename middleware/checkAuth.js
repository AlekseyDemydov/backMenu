import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const checkAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Немає токена' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Невірний або прострочений токен' });
  }
};