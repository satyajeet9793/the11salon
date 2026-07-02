const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const services = [
  // Hair Mens
  { category: "Hair Mens", name: "Hair Cut Boys", price: 300, duration: 30 },
  { category: "Hair Mens", name: "Hair Cut Mens", price: 500, duration: 45 },
  { category: "Hair Mens", name: "Hair Wash", price: 200, duration: 15 },
  { category: "Hair Mens", name: "Long Hair Cut", price: 600, duration: 60 },
  { category: "Hair Mens", name: "Beard", price: 300, duration: 20 },
  { category: "Hair Mens", name: "Machine Trim Beard", price: 200, duration: 15 },
  { category: "Hair Mens", name: "Hair Color", price: 1200, duration: 60 },
  { category: "Hair Mens", name: "Beard Color", price: 800, duration: 30 },
  { category: "Hair Mens", name: "High Lights", price: 1500, duration: 90 },
  { category: "Hair Mens", name: "One Strip Highlight", price: 200, duration: 30 },
  { category: "Hair Mens", name: "Botox", price: 3000, duration: 120 },
  { category: "Hair Mens", name: "Nanoplastia", price: 4000, duration: 150 },
  { category: "Hair Mens", name: "Head Massage", price: 800, duration: 45 },
  { category: "Hair Mens", name: "Hair Spa", price: 1300, duration: 60 },
  { category: "Hair Mens", name: "Hair Fall Spa", price: 2500, duration: 60 },
  { category: "Hair Mens", name: "High Frequency", price: 1500, duration: 45 },
  { category: "Hair Mens", name: "Dandruff", price: 800, duration: 45 },
  { category: "Hair Mens", name: "Plex Treatment", price: 2000, duration: 60 },

  // Hair Women
  { category: "Hair Women", name: "Hair Trimming", price: 600, duration: 30 },
  { category: "Hair Women", name: "Hair Cut Normal", price: 800, duration: 45 },
  { category: "Hair Women", name: "Advance Hair Cut", price: 1000, duration: 60 },
  { category: "Hair Women", name: "Girls Hair Cut", price: 500, duration: 45 },
  { category: "Hair Women", name: "Hair Wash", price: 300, duration: 20 },
  { category: "Hair Women", name: "Straight Blow Dry", price: 200, duration: 30 },
  { category: "Hair Women", name: "Out Curl's Blow Dry", price: 300, duration: 45 },
  { category: "Hair Women", name: "One Strip", price: 300, duration: 30 },
  { category: "Hair Women", name: "Root Touchup", price: 1500, duration: 60 },
  { category: "Hair Women", name: "Global Hair", price: 3000, duration: 120 },
  { category: "Hair Women", name: "Botox", price: 4000, duration: 150 },
  { category: "Hair Women", name: "Nanoplastia", price: 6000, duration: 180 },
  { category: "Hair Women", name: "Hair Spa", price: 1500, duration: 60 },
  { category: "Hair Women", name: "Hair Fall Hair Spa", price: 2000, duration: 60 },
  { category: "Hair Women", name: "Head Massage", price: 1000, duration: 45 },
  { category: "Hair Women", name: "Anti Dandruff", price: 1000, duration: 60 },
  { category: "Hair Women", name: "High Frequency", price: 2000, duration: 45 },
  { category: "Hair Women", name: "Hair Plex Treatment", price: 3000, duration: 90 },
  { category: "Hair Women", name: "Temporary Ironing", price: 800, duration: 45 },
  { category: "Hair Women", name: "Temporary Tong", price: 1000, duration: 60 },

  // Facial
  { category: "Facial", name: "D-Tan", price: 500, duration: 30 },
  { category: "Facial", name: "Basic Cleanup", price: 800, duration: 45 },
  { category: "Facial", name: "D-Tan Cleanup", price: 1200, duration: 60 },
  { category: "Facial", name: "Basic Facial", price: 1500, duration: 60 },
  { category: "Facial", name: "D-Tan Facial", price: 1800, duration: 75 },
  { category: "Facial", name: "Organic D-Tan Facial", price: 2200, duration: 75 },
  { category: "Facial", name: "With D-Tan Facial", price: 2500, duration: 75 },
  { category: "Facial", name: "Whitening Facial", price: 2500, duration: 75 },
  { category: "Facial", name: "Haydra Facial", price: 3000, duration: 90 },
  { category: "Facial", name: "Gold Facial", price: 3000, duration: 90 },
  { category: "Facial", name: "Diamond Facial", price: 3000, duration: 90 },

  // Make Up & Spa
  { category: "Make Up", name: "Normal Basic Makeup", price: 1200, duration: 60 },
  { category: "Make Up", name: "M-Drit H", price: 3000, duration: 90 },
  { category: "Make Up", name: "Natural Nude Makeup", price: 3500, duration: 90 },
  { category: "Make Up", name: "HD makeup", price: 12000, duration: 150 },
  { category: "Make Up", name: "Matte makeup", price: 4000, duration: 120 },
  { category: "Make Up", name: "Bridle Ainarush makeup", price: 1500, duration: 90 },
  { category: "Make Up", name: "Smokey Makeup", price: 3000, duration: 90 },
  { category: "Make Up", name: "Mineral Makeup", price: 8000, duration: 120 },
  { category: "Make Up", name: "Maternity Makeup", price: 7000, duration: 120 },
  
  { category: "Spa", name: "Sweedish Massage", price: 3000, duration: 60 },
  { category: "Spa", name: "Deep Tissue Massage", price: 3500, duration: 60 },
  { category: "Spa", name: "Balinese Massage", price: 3500, duration: 60 },

  // Manicure Pedicure
  { category: "Manicure", name: "Basic Manicure", price: 800, duration: 45 },
  { category: "Manicure", name: "Advance Manicure", price: 1200, duration: 60 },
  { category: "Manicure", name: "Only Massage Oil", price: 300, duration: 20 },
  { category: "Pedicure", name: "Basic Pedicure", price: 1000, duration: 45 },
  { category: "Pedicure", name: "Advance Pedicure", price: 1300, duration: 60 },
  { category: "Pedicure", name: "Oil Massage", price: 400, duration: 20 },
  { category: "Pedicure", name: "Cream Massage", price: 500, duration: 20 },
  { category: "Body Polish", name: "Body Polish", price: 4999, duration: 90 },
  { category: "Body Polish", name: "Scrub", price: 2000, duration: 45 },

  // Nail Art
  { category: "Nail Art", name: "Normal Nail Paint", price: 200, duration: 20 },
  { category: "Nail Art", name: "Gel Polish", price: 400, duration: 30 },
  { category: "Nail Art", name: "French Nail Art", price: 300, duration: 45 },
  { category: "Nail Art", name: "Glitter Nails", price: 400, duration: 45 },
  { category: "Nail Art", name: "Chrome Nails", price: 800, duration: 45 },
  { category: "Nail Art", name: "Ombre Nails", price: 600, duration: 45 },
  { category: "Nail Art", name: "Cat Eye Nails", price: 700, duration: 45 },
  { category: "Nail Art", name: "Basic Nail Extension", price: 900, duration: 90 },
  { category: "Nail Art", name: "Gel Extension", price: 1500, duration: 90 },
  { category: "Nail Art", name: "Acrylic Extension", price: 1800, duration: 120 },
  { category: "Nail Art", name: "Refill", price: 900, duration: 60 },
  { category: "Nail Art", name: "Nail Removal", price: 400, duration: 30 },
  { category: "Nail Art", name: "Bridle", price: 3000, duration: 120 },

  // Beauty Services
  { category: "Waxing", name: "Face Wax", price: 400, duration: 20 },
  { category: "Waxing", name: "Under Arms Wax", price: 300, duration: 15 },
  { category: "Waxing", name: "Hand Wax", price: 700, duration: 30 },
  { category: "Waxing", name: "Half Leg Wax", price: 700, duration: 30 },
  { category: "Waxing", name: "Full Leg Wax", price: 900, duration: 45 },
  { category: "Waxing", name: "Stomach Wax", price: 800, duration: 30 },
  { category: "Waxing", name: "Back Wax", price: 800, duration: 30 },
  { category: "Waxing", name: "Front Wax", price: 800, duration: 30 },
  { category: "Waxing", name: "Butt Wax", price: 1000, duration: 30 },
  { category: "Waxing", name: "Bikini Line Wax", price: 2000, duration: 45 },
  { category: "Waxing", name: "Brazilian Wax", price: 2500, duration: 60 },
  { category: "Waxing", name: "Full Body Wax", price: 5000, duration: 120 },
  { category: "Threading", name: "Eye Brow", price: 80, duration: 10 },
  { category: "Threading", name: "Upper Lips", price: 50, duration: 5 },
  { category: "Threading", name: "Fore Head", price: 50, duration: 5 },
  { category: "Threading", name: "Chin", price: 50, duration: 5 },
  { category: "Threading", name: "Check", price: 50, duration: 5 },
];

async function main() {
  console.log('Wiping existing services and related data to avoid foreign key constraints...');
  
  // Clean up related tables first
  await prisma.payment.deleteMany({});
  await prisma.waitlist.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.service.deleteMany({});

  console.log('Seeding new actual services from menu cards...');
  for (const service of services) {
    await prisma.service.create({
      data: service
    });
  }
  
  console.log(`Successfully seeded ${services.length} services!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
