import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const tests = [
  { name: 'Hemograma completo', description: 'Evaluación general de células sanguíneas.', price: '35.00', durationMin: 20 },
  { name: 'Glucosa', description: 'Medición de glucosa en sangre.', price: '15.00', durationMin: 15 },
  { name: 'Perfil lipídico', description: 'Evaluación de colesterol y triglicéridos.', price: '45.00', durationMin: 30 },
  { name: 'Examen completo de orina', description: 'Análisis físico, químico y microscópico de orina.', price: '20.00', durationMin: 20 },
  { name: 'Urea y creatinina', description: 'Pruebas de función renal.', price: '30.00', durationMin: 20 }
];

for (const test of tests) {
  const existing = await prisma.labTest.findFirst({ where: { name: test.name } });
  if (existing) {
    await prisma.labTest.update({
      where: { id: existing.id },
      data: { description: test.description, price: test.price, durationMin: test.durationMin, active: true }
    });
  } else {
    await prisma.labTest.create({ data: test });
  }
}

console.log(`Se cargaron ${tests.length} análisis de ejemplo.`);
await prisma.$disconnect();
