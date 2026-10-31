import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ZodError } from 'zod';
import authRoutes from './routes/auth.js';
import labTestRoutes from './routes/lab-tests.js';
import appointmentRoutes from './routes/appointments.js';

if (!process.env.JWT_SECRET) throw new Error('Falta configurar JWT_SECRET en .env');

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'ucv-laboratorio-api' }));
app.use('/api/auth', authRoutes);
app.use('/api/lab-tests', labTestRoutes);
app.use('/api/appointments', appointmentRoutes);

app.use((error, _req, res, _next) => {
  if (error instanceof ZodError) return res.status(400).json({ message: 'Datos inválidos.', details: error.issues });
  console.error(error);
  return res.status(500).json({ message: 'Ocurrió un error interno.' });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`API escuchando en puerto ${port}`));