const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const services = [
  { name: "Classic Haircut", category: "Haircut", duration: 30, price: 500, description: "Standard professional men's or women's haircut." },
  { name: "Premium Fade", category: "Haircut", duration: 45, price: 750, description: "Detailed fade with hot towel." },
  { name: "Hair Styling & Blowdry", category: "Hair Styling", duration: 45, price: 800, description: "Professional styling for events." },
  { name: "Root Touch-up", category: "Hair Color", duration: 60, price: 1500, description: "Dye applied only to the roots." },
  { name: "Global Hair Color", category: "Hair Color", duration: 120, price: 4000, description: "Full hair color transformation." },
  { name: "Beard Trim & Shape", category: "Beard & Shave", duration: 30, price: 300, description: "Precision beard shaping." },
  { name: "Classic Wet Shave", category: "Beard & Shave", duration: 30, price: 400, description: "Hot towel straight razor shave." },
  { name: "Deep Cleansing Facial", category: "Facial & Skin", duration: 60, price: 2000, description: "Rejuvenating face scrub and mask." },
  { name: "Bridal Makeup", category: "Bridal", duration: 180, price: 15000, description: "Full premium bridal package." },
  { name: "Relaxation Massage", category: "Massage", duration: 60, price: 2500, description: "Full body Swedish massage." }
];

async function main() {
  console.log("Seeding services...");
  for (const s of services) {
    await prisma.service.create({
      data: s
    });
  }
  console.log("Services seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
