import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();
router.get('/', async (_req, res, next) => {
  try {
    const tests = await prisma.labTest.findMany({ where: { active: true }, orderBy: { name: 'asc' } });
    res.json({ tests });
  } catch (error) { next(error); }
});

export default router;