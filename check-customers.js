const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const customers = await prisma.customer.findMany();
  console.log('Customers in DB:', customers);
}
main().then(() => prisma.$disconnect());
