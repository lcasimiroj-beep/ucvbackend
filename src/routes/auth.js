import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db.js';

const router = Router();
const registerSchema = z.object({
  fullName: z.string().min(3).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().max(30).optional(),
  document: z.string().min(8).max(20).optional()
});

router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: { ...data, passwordHash },
      select: { id: true, fullName: true, email: true, phone: true, document: true, role: true }
    });
    res.status(201).json({ user });
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ message: 'El correo o documento ya está registrado.' });
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const data = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
    }
    const token = jwt.sign({ sub: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (error) { next(error); }
});

export default router;