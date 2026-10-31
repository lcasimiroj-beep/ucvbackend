# UCV Laboratorio API

API inicial para el sistema de citas de laboratorio.

## Requisitos
- Node.js 20+
- PostgreSQL 15+

## Instalación
1. Copia `.env.example` a `.env` y configura PostgreSQL y JWT_SECRET.
2. Ejecuta `npm install`.
3. Ejecuta `npx prisma generate`.
4. Ejecuta `npx prisma migrate dev --name init`.
5. Ejecuta `npm run dev`.

## Rutas iniciales
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/lab-tests`
- POST `/api/appointments` (paciente autenticado)
- GET `/api/appointments/my` (paciente autenticado)
- GET `/api/appointments` (administrador)
- PATCH `/api/appointments/:id/status` (administrador)

La primera cuenta administradora debe crearse manualmente cambiando su rol a ADMIN en la base de datos. No existe una ruta pública para otorgar permisos administrativos.
