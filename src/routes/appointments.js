import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.post('/', async (req, res, next) => {
  try {
    const data = z.object({
      labTestId: z.string().uuid(),
      scheduledAt: z.string().datetime(),
      notes: z.string().max(500).optional()
    }).parse(req.body);
    const scheduledAt = new Date(data.scheduledAt);
    if (scheduledAt <= new Date()) return res.status(400).json({ message: 'Selecciona una fecha futura.' });
    const test = await prisma.labTest.findFirst({ where: { id: data.labTestId, active: true } });
    if (!test) return res.status(404).json({ message: 'El análisis seleccionado no está disponible.' });

    const start = new Date(scheduledAt.getTime() - test.durationMin * 60000);
    const end = new Date(scheduledAt.getTime() + test.durationMin * 60000);
    const conflict = await prisma.appointment.findFirst({
      where: { status: { in: ['PENDING', 'CONFIRMED'] }, scheduledAt: { gte: start, lte: end } }
    });
    if (conflict) return res.status(409).json({ message: 'Ese horario ya está ocupado. Selecciona otro.' });

    const appointment = await prisma.appointment.create({
      data: { userId: req.user.sub, labTestId: data.labTestId, scheduledAt, notes: data.notes },
      include: { labTest: true }
    });
    res.status(201).json({ appointment });
  } catch (error) { next(error); }
});

router.get('/my', async (req, res, next) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { userId: req.user.sub },
      include: { labTest: true },
      orderBy: { scheduledAt: 'desc' }
    });
    res.json({ appointments });
  } catch (error) { next(error); }
});

router.get('/', requireAdmin, async (_req, res, next) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: { user: { select: { id: true, fullName: true, email: true, phone: true, document: true } }, labTest: true },
      orderBy: { scheduledAt: 'asc' }
    });
    res.json({ appointments });
  } catch (error) { next(error); }
});

router.patch('/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.enum(['CONFIRMED', 'COMPLETED', 'CANCELLED']) }).parse(req.body);
    const appointment = await prisma.appointment.update({ where: { id: req.params.id }, data: { status } });
    res.json({ appointment });
  } catch (error) { next(error); }
});

router.patch('/:id/cancel', async (req, res, next) => {
  try {
    const appointment = await prisma.appointment.findFirst({ where: { id: req.params.id, userId: req.user.sub } });
    if (!appointment) return res.status(404).json({ message: 'No se encontró la cita.' });
    if (['COMPLETED', 'CANCELLED'].includes(appointment.status)) return res.status(400).json({ message: 'Esta cita ya no se puede cancelar.' });
    const updated = await prisma.appointment.update({ where: { id: appointment.id }, data: { status: 'CANCELLED' } });
    res.json({ appointment: updated });
  } catch (error) { next(error); }
});

export default router;