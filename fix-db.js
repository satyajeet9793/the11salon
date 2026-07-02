const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const appointments = await prisma.appointment.findMany();
  for (const apt of appointments) {
    if (apt.customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: apt.customerId } });
      if (!customer) {
        console.log(`Orphan appointment found: ${apt.id} with missing customer: ${apt.customerId}`);
        await prisma.payment.deleteMany({ where: { appointmentId: apt.id } });
        await prisma.appointment.delete({ where: { id: apt.id } });
        console.log(`Deleted orphan appointment ${apt.id}`);
      }
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
