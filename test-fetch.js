const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const date = "2026-06-10";
  const parsedDate = new Date(date);
  const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));

  console.log("Input date:", date);
  console.log("startOfDay:", startOfDay.toISOString());
  console.log("endOfDay:", endOfDay.toISOString());

  const appointments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });
  console.log("Appointments found:", appointments.length);
  console.log(JSON.stringify(appointments, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
