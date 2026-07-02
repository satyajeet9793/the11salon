const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Clearing old services...");
  await prisma.service.deleteMany(); // Clear out existing mock data to avoid duplicates

  console.log("Seeding services from menu...");
  const services = [
    // Waxing (Ladies)
    { name: "Under Arms Wax", category: "Waxing", price: 200, duration: 15 },
    { name: "Full Arms Wax", category: "Waxing", price: 700, duration: 30 },
    { name: "Half Arms Wax", category: "Waxing", price: 400, duration: 20 },
    { name: "Full Leg Wax", category: "Waxing", price: 900, duration: 45 },
    { name: "Half Leg Wax", category: "Waxing", price: 550, duration: 30 },
    { name: "Stomach Wax", category: "Waxing", price: 800, duration: 20 },
    { name: "Full (Front / Back) Wax", category: "Waxing", price: 1000, duration: 45 },
    { name: "Half (Front / Back) Wax", category: "Waxing", price: 600, duration: 30 },
    { name: "Butt Wax", category: "Waxing", price: 1000, duration: 30 },
    { name: "Bikini Line Wax", category: "Waxing", price: 2000, duration: 30 },
    { name: "Brazilian Wax", category: "Waxing", price: 2500, duration: 45 },
    { name: "Full Body Wax", category: "Waxing", price: 5000, duration: 120 },

    // Men's Skin & Hair
    { name: "Men's Hair Cut", category: "Men's Hair", price: 300, duration: 30 },
    { name: "Beard Styles", category: "Men's Hair", price: 200, duration: 20 },
    { name: "Men's Hair Wash", category: "Men's Hair", price: 100, duration: 15 },
    { name: "Men's High Lights - One Strip", category: "Men's Hair", price: 200, duration: 30 },
    { name: "Men's High Lights - All Over", category: "Men's Hair", price: 1000, duration: 60 },
    { name: "Men's Straightning", category: "Men's Hair", price: 2000, duration: 90 },
    { name: "Men's Hair Spa", category: "Men's Hair", price: 1000, duration: 45 },
    { name: "Men's Head Massage", category: "Men's Hair", price: 500, duration: 30 },
    { name: "Men's Anti Dandruff", category: "Men's Hair", price: 500, duration: 30 },
    { name: "Men's Dandruff High Frequency", category: "Men's Hair", price: 1500, duration: 45 },
    { name: "Men's Hair Fall Treatment", category: "Men's Hair", price: 1500, duration: 45 },
    { name: "Men's Wella Flex", category: "Men's Hair", price: 2000, duration: 60 },
    
    // Kids
    { name: "Baby Hair Cut (Boy)", category: "Kids", price: 200, duration: 30 },
    { name: "Baby Hair Cut (Girl)", category: "Kids", price: 300, duration: 30 },

    // Ladies Skin & Hair
    { name: "Ladies Hair Cut", category: "Ladies Hair", price: 700, duration: 45 },
    { name: "Trimming", category: "Ladies Hair", price: 400, duration: 30 },
    { name: "Ladies Hair Wash", category: "Ladies Hair", price: 200, duration: 15 },
    { name: "Straight Blow Dry", category: "Ladies Hair", price: 200, duration: 30 },
    { name: "Out Curls", category: "Ladies Hair", price: 300, duration: 30 },
    { name: "Ladies High Lights - One Strip", category: "Ladies Hair", price: 300, duration: 30 },
    { name: "High Lights - Root Touch up", category: "Ladies Hair", price: 1300, duration: 60 },
    { name: "High Lights - Global", category: "Ladies Hair", price: 3000, duration: 90 },
    { name: "Ladies Straightning", category: "Ladies Hair", price: 4000, duration: 120 },
    { name: "Ladies Hair Spa", category: "Ladies Hair", price: 1200, duration: 60 },
    { name: "Ladies Head Massage", category: "Ladies Hair", price: 700, duration: 30 },
    { name: "Ladies Anti Dandruff", category: "Ladies Hair", price: 500, duration: 45 },
    { name: "Ladies Dandruff High Frequency", category: "Ladies Hair", price: 2000, duration: 60 },
    { name: "Ladies Hair Fall Treatment", category: "Ladies Hair", price: 2000, duration: 60 },
    { name: "Ladies Wella Flex", category: "Ladies Hair", price: 3000, duration: 90 },
    { name: "Botox Hair Treatment - Shoulder Length", category: "Ladies Hair", price: 3000, duration: 120 },
    { name: "Botox Hair Treatment - Below Shoulder", category: "Ladies Hair", price: 5000, duration: 150 },
    { name: "Hair Ironing", category: "Ladies Hair", price: 800, duration: 45 },

    // Pedicure & Manicure
    { name: "Basic Pedicure", category: "Nails", price: 500, duration: 30 },
    { name: "Dry Pedicure", category: "Nails", price: 250, duration: 15 },
    { name: "Spa Pedicure", category: "Nails", price: 1000, duration: 45 },
    { name: "Opi Pedicure", category: "Nails", price: 1500, duration: 60 },
    { name: "Basic Manicure", category: "Nails", price: 500, duration: 30 },
    { name: "Dry Manicure", category: "Nails", price: 250, duration: 15 },
    { name: "Spa Manicure", category: "Nails", price: 1000, duration: 45 },
    { name: "Opi Manicure", category: "Nails", price: 1500, duration: 60 },

    // Facials & Cleanup
    { name: "Cleanup", category: "Skin", price: 1200, duration: 45 },
    { name: "Fruit Cleanup", category: "Skin", price: 800, duration: 30 },
    { name: "Diamond Facial", category: "Skin", price: 3000, duration: 60 },
    { name: "Gold Facial", category: "Skin", price: 2500, duration: 60 },
    { name: "Whitening Facial", category: "Skin", price: 3000, duration: 60 },
    { name: "Chocolate Facial", category: "Skin", price: 1500, duration: 45 },
    { name: "Face Back Polishing", category: "Skin", price: 1200, duration: 45 },
    { name: "D-Tan Facial", category: "Skin", price: 2000, duration: 60 },

    // Makeup
    { name: "Basic Make-Up", category: "Makeup", price: 800, duration: 45 },
    { name: "Eye Make-Up", category: "Makeup", price: 400, duration: 30 },
    { name: "Party Make-Up", category: "Makeup", price: 2000, duration: 90 },
    { name: "Bridal Make-Up", category: "Makeup", price: 5000, duration: 150 },

    // Threading
    { name: "Eyebrow Threading", category: "Threading", price: 50, duration: 15 },
    { name: "Upper Lips Threading", category: "Threading", price: 50, duration: 10 },
    { name: "Fore Head Threading", category: "Threading", price: 50, duration: 10 },
    { name: "Chin Threading", category: "Threading", price: 30, duration: 10 },
    { name: "Cheek Threading", category: "Threading", price: 100, duration: 15 },

    // Spa & Relaxing Therapy
    { name: "Back Massage", category: "Spa & Relaxing Therapy", price: 600, duration: 20 },
    { name: "Foot Massage", category: "Spa & Relaxing Therapy", price: 600, duration: 20 },
    { name: "Neck Massage", category: "Spa & Relaxing Therapy", price: 350, duration: 20 },
    { name: "Shoulder Massage", category: "Spa & Relaxing Therapy", price: 350, duration: 20 },
    { name: "Sweet Dish Spa", category: "Spa & Relaxing Therapy", price: 1700, duration: 45 },
    { name: "Deep Tissue Massage", category: "Spa & Relaxing Therapy", price: 2000, duration: 45 },
    { name: "Oil Spa", category: "Spa & Relaxing Therapy", price: 3000, duration: 60 },
    { name: "Steam Spa (45 min)", category: "Spa & Relaxing Therapy", price: 2500, duration: 45 },
    { name: "Steam Spa (65 min)", category: "Spa & Relaxing Therapy", price: 3000, duration: 65 }
  ];

  for (const service of services) {
    await prisma.service.create({ data: service });
  }

  console.log("Successfully seeded all services from the menu!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
