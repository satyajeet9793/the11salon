import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const today = new Date('2026-08-10T00:00:00.000Z');
    const startOfDay = new Date(today);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setUTCHours(23, 59, 59, 999);

    console.log(`Deleting appointments between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`);

    // First find them to see how many we are deleting
    const apps = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    console.log(`Found ${apps.length} appointments to delete.`);

    if (apps.length > 0) {
      // Delete associated payments first to prevent foreign key errors
      const ids = apps.map(a => a.id);
      
      const paymentsDeleted = await prisma.payment.deleteMany({
        where: { appointmentId: { in: ids } }
      });
      console.log(`Deleted ${paymentsDeleted.count} associated payments.`);

      const appsDeleted = await prisma.appointment.deleteMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });
      console.log(`Deleted ${appsDeleted.count} appointments.`);
    }
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
