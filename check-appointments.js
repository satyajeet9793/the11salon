const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const appointments = await prisma.appointment.findMany({
    select: {
      id: true,
      date: true,
      timeSlot: true,
      status: true
    }
  });
  console.log(JSON.stringify(appointments, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
