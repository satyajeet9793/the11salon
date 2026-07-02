const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const envFile = fs.readFileSync('.env', 'utf-8');
const directUrlMatch = envFile.match(/DIRECT_URL="(.*?)"/);
const directUrl = directUrlMatch ? directUrlMatch[1] : process.env.DIRECT_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: directUrl,
    },
  },
});

const services = [
  // Hair Mens
  { name: "Hair Cut Boys", category: "Hair Mens", duration: 30, price: 300, description: "Professional haircut for boys." },
  { name: "Hair Cut Mens", category: "Hair Mens", duration: 30, price: 500, description: "Professional men's haircut." },
  { name: "Hair Wash", category: "Hair Mens", duration: 15, price: 200, description: "Standard hair wash." },
  { name: "Long Hair Cut", category: "Hair Mens", duration: 45, price: 600, description: "Haircut for long hair." },
  { name: "Beard", category: "Hair Mens", duration: 20, price: 300, description: "Beard shaping and trimming." },
  { name: "Machine Trim Beard", category: "Hair Mens", duration: 15, price: 200, description: "Quick machine trim for beard." },
  { name: "Hair Color", category: "Hair Mens", duration: 45, price: 1200, description: "Full hair color." },
  { name: "Beard Color", category: "Hair Mens", duration: 30, price: 800, description: "Beard color application." },
  { name: "High Lights", category: "Hair Mens", duration: 60, price: 1500, description: "Hair highlights." },
  { name: "One Strip Highlight", category: "Hair Mens", duration: 30, price: 200, description: "Single strip highlight." },
  { name: "Botox", category: "Hair Mens", duration: 90, price: 3000, description: "Hair botox treatment." },
  { name: "Nanoplastia", category: "Hair Mens", duration: 120, price: 4000, description: "Nanoplastia hair treatment." },
  { name: "Head Massage", category: "Hair Mens", duration: 30, price: 800, description: "Relaxing head massage." },
  { name: "Hair Spa", category: "Hair Mens", duration: 45, price: 1300, description: "Nourishing hair spa." },
  { name: "Hair Spa / Hair Fall", category: "Hair Mens", duration: 60, price: 2500, description: "Hair spa specialized for hair fall." },
  { name: "High Frequency", category: "Hair Mens", duration: 30, price: 1500, description: "High frequency hair treatment." },
  { name: "Dandruff", category: "Hair Mens", duration: 45, price: 800, description: "Dandruff treatment." },
  { name: "Plex Treatment", category: "Hair Mens", duration: 60, price: 2000, description: "Plex hair treatment." },

  // Hair Women
  { name: "Hair Trimming", category: "Hair Women", duration: 30, price: 600, description: "Basic hair trimming." },
  { name: "Hair Cut Normal", category: "Hair Women", duration: 45, price: 800, description: "Normal women's haircut." },
  { name: "Advance Hair Cut", category: "Hair Women", duration: 60, price: 1000, description: "Advanced styled haircut." },
  { name: "Girls Hair Cut", category: "Hair Women", duration: 30, price: 500, description: "Haircut for girls." },
  { name: "Hair Wash", category: "Hair Women", duration: 20, price: 300, description: "Professional hair wash." },
  { name: "Straight Blow Dry", category: "Hair Women", duration: 30, price: 200, description: "Straight blow dry setting." },
  { name: "Out Curl's Blow Dry", category: "Hair Women", duration: 45, price: 300, description: "Out curls blow dry setting." },
  { name: "One Strip", category: "Hair Women", duration: 30, price: 300, description: "One strip hair color." },
  { name: "Root Touchup", category: "Hair Women", duration: 45, price: 1500, description: "Root touchup color." },
  { name: "Global Hair", category: "Hair Women", duration: 120, price: 3000, description: "Global hair color." },
  { name: "Botox", category: "Hair Women", duration: 120, price: 4000, description: "Hair botox treatment." },
  { name: "Nanoplastia", category: "Hair Women", duration: 150, price: 6000, description: "Nanoplastia hair treatment." },
  { name: "Hair Spa", category: "Hair Women", duration: 60, price: 1500, description: "Nourishing hair spa." },
  { name: "Hair Fall Hair Spa", category: "Hair Women", duration: 60, price: 2000, description: "Specialized hair fall spa." },
  { name: "Head Massage", category: "Hair Women", duration: 30, price: 1000, description: "Relaxing head massage." },

  // Hair Treatment
  { name: "Anti Dandruff", category: "Hair Treatment", duration: 60, price: 1000, description: "Anti dandruff treatment." },
  { name: "High Frequency", category: "Hair Treatment", duration: 45, price: 2000, description: "High frequency treatment." },
  { name: "Hair Plex Treatment", category: "Hair Treatment", duration: 90, price: 3000, description: "Advanced hair plex treatment." },
  { name: "Temporary Ironing", category: "Hair Treatment", duration: 45, price: 800, description: "Temporary hair ironing." },
  { name: "Temporary Tong", category: "Hair Treatment", duration: 45, price: 1000, description: "Temporary tong styling." },

  // Facial
  { name: "D-Tan", category: "Facial", duration: 30, price: 500, description: "D-Tan cleanup." },
  { name: "Basic Cleanup", category: "Facial", duration: 45, price: 800, description: "Basic facial cleanup." },
  { name: "D-Tan Cleanup", category: "Facial", duration: 45, price: 1200, description: "Advanced D-Tan cleanup." },
  { name: "Basic Facial", category: "Facial", duration: 60, price: 1500, description: "Standard relaxing facial." },
  { name: "D-Tan Facial", category: "Facial", duration: 60, price: 1800, description: "Facial with D-Tan." },
  { name: "Organic D-Tan Facial", category: "Facial", duration: 75, price: 2200, description: "Organic D-Tan facial." },
  { name: "With D-Tan Facial", category: "Facial", duration: 75, price: 2500, description: "Premium facial with D-Tan." },
  { name: "Whitening Facial", category: "Facial", duration: 75, price: 2500, description: "Whitening facial treatment." },
  { name: "Haydra Facial", category: "Facial", duration: 90, price: 3000, description: "Advanced Hydra facial." },
  { name: "Gold Facial", category: "Facial", duration: 90, price: 3000, description: "Premium gold facial." },
  { name: "Diamond Facial", category: "Facial", duration: 90, price: 3000, description: "Premium diamond facial." },

  // Makeup & Spa
  { name: "Normal Basic Makeup", category: "Make Up", duration: 45, price: 1200, description: "Normal basic makeup." },
  { name: "M-Drit H", category: "Make Up", duration: 60, price: 3000, description: "M-Drit H makeup." },
  { name: "Natural Nude Makeup", category: "Make Up", duration: 60, price: 3500, description: "Natural nude look makeup." },
  { name: "HD makeup", category: "Make Up", duration: 90, price: 12000, description: "High definition makeup." },
  { name: "Matte makeup", category: "Make Up", duration: 90, price: 4000, description: "Matte finish makeup." },
  { name: "Bridle Ainarush makeup", category: "Make Up", duration: 150, price: 15000, description: "Bridal airbrush makeup." },
  { name: "Smokey Makeup", category: "Make Up", duration: 60, price: 3000, description: "Smokey eye makeup." },
  { name: "Mineral Makeup", category: "Make Up", duration: 60, price: 8000, description: "Mineral makeup." },
  { name: "Maternity Makeup", category: "Make Up", duration: 90, price: 7000, description: "Maternity photoshoot makeup." },
  { name: "Sweedish Massage", category: "Spa", duration: 60, price: 3000, description: "Swedish massage." },
  { name: "Deep Tissue Massage", category: "Spa", duration: 60, price: 3500, description: "Deep tissue massage." },
  { name: "Balinese Massage", category: "Spa", duration: 60, price: 3500, description: "Balinese massage." },

  // Manicure Pedicure
  { name: "Basic Manicure", category: "Manicure & Pedicure", duration: 45, price: 800, description: "Basic manicure." },
  { name: "Advance Manicure", category: "Manicure & Pedicure", duration: 60, price: 1200, description: "Advanced manicure." },
  { name: "Only Massage Oil", category: "Manicure & Pedicure", duration: 20, price: 300, description: "Oil massage for hands." },
  { name: "Basic Pedicure", category: "Manicure & Pedicure", duration: 45, price: 1000, description: "Basic pedicure." },
  { name: "Advance Pedicure", category: "Manicure & Pedicure", duration: 60, price: 1300, description: "Advanced pedicure." },
  { name: "Oil Massage", category: "Manicure & Pedicure", duration: 20, price: 400, description: "Oil massage for feet." },
  { name: "Cream Massage", category: "Manicure & Pedicure", duration: 20, price: 500, description: "Cream massage for feet." },
  { name: "Body Polish", category: "Manicure & Pedicure", duration: 90, price: 4999, description: "Full body polish." },
  { name: "Scrub", category: "Manicure & Pedicure", duration: 45, price: 2000, description: "Body scrub." },

  // Nail Art
  { name: "Normal Nail Paint", category: "Nail Art", duration: 20, price: 200, description: "Normal nail polish." },
  { name: "Gel Polish", category: "Nail Art", duration: 30, price: 400, description: "Gel nail polish." },
  { name: "French Nail Art", category: "Nail Art", duration: 45, price: 300, description: "French nail art." },
  { name: "Glitter Nails", category: "Nail Art", duration: 45, price: 400, description: "Glitter nail art." },
  { name: "Chrome Nails", category: "Nail Art", duration: 45, price: 800, description: "Chrome nail art." },
  { name: "Ombre Nails", category: "Nail Art", duration: 60, price: 600, description: "Ombre nail art." },
  { name: "Cat Eye Nails", category: "Nail Art", duration: 60, price: 700, description: "Cat eye nail art." },
  { name: "Basic Nail Extension", category: "Nail Art", duration: 90, price: 900, description: "Basic nail extension." },
  { name: "Gel Extension", category: "Nail Art", duration: 120, price: 1500, description: "Gel nail extension." },
  { name: "Acrylic Extension", category: "Nail Art", duration: 120, price: 1800, description: "Acrylic nail extension." },
  { name: "refill", category: "Nail Art", duration: 60, price: 900, description: "Nail extension refill." },
  { name: "Nail Removal", category: "Nail Art", duration: 45, price: 400, description: "Nail extension removal." },
  { name: "Bridle", category: "Nail Art", duration: 120, price: 3000, description: "Bridal nail art." },

  // Beauty Services
  { name: "Face Wax", category: "Beauty Services", duration: 20, price: 400, description: "Face wax." },
  { name: "Under Arms Wax", category: "Beauty Services", duration: 15, price: 300, description: "Under arms wax." },
  { name: "Hand Wax", category: "Beauty Services", duration: 30, price: 700, description: "Hand wax." },
  { name: "Half Leg Wax", category: "Beauty Services", duration: 30, price: 700, description: "Half leg wax." },
  { name: "Full Leg Wax", category: "Beauty Services", duration: 45, price: 900, description: "Full leg wax." },
  { name: "Stomach Wax", category: "Beauty Services", duration: 30, price: 800, description: "Stomach wax." },
  { name: "Back Wax", category: "Beauty Services", duration: 30, price: 800, description: "Back wax." },
  { name: "Front Wax", category: "Beauty Services", duration: 30, price: 800, description: "Front wax." },
  { name: "Butt Wax", category: "Beauty Services", duration: 30, price: 1000, description: "Butt wax." },
  { name: "Bikini Line Wax", category: "Beauty Services", duration: 30, price: 2000, description: "Bikini line wax." },
  { name: "Brazilian Wax", category: "Beauty Services", duration: 45, price: 2500, description: "Brazilian wax." },
  { name: "Full Body Wax", category: "Beauty Services", duration: 120, price: 5000, description: "Full body wax." },
  { name: "Eye Brow", category: "Beauty Services", duration: 15, price: 80, description: "Eye brow threading." },
  { name: "Upper Lips", category: "Beauty Services", duration: 10, price: 50, description: "Upper lips threading." },
  { name: "Fore Head", category: "Beauty Services", duration: 10, price: 50, description: "Fore head threading." },
  { name: "Chin", category: "Beauty Services", duration: 10, price: 50, description: "Chin threading." },
  { name: "Check", category: "Beauty Services", duration: 10, price: 50, description: "Cheek threading." }
];

async function main() {
  console.log("Clearing old data...");
  await prisma.payment.deleteMany();
  await prisma.waitlist.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  
  console.log(`Seeding ${services.length} services from all menu cards...`);
  for (const s of services) {
    await prisma.service.create({
      data: s
    });
  }
  console.log("All services seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
