import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const settings = await prisma.settings.findMany();
    // Convert array of {key, value} to a single object {key: value}
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
    
    return NextResponse.json(settingsObject);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Body should be an object of key-value pairs
    // e.g. { salonName: "The 11 Salon", phone: "1234567890" }
    
    const updates = [];
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        updates.push(
          prisma.settings.upsert({
            where: { key },
            update: { value },
            create: { key, value },
          })
        );
      }
    }
    
    await prisma.$transaction(updates);
    
    return NextResponse.json({ success: true, message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
