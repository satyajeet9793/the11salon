import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');

  let whereClause = {};
  if (date) {
    const parsedDate = new Date(date);
    const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));
    
    whereClause = {
      date: {
        gte: startOfDay,
        lte: endOfDay
      }
    };
  }

  const appointments = await prisma.appointment.findMany({
    where: whereClause,
    include: {
      customer: true,
      service: true,
      staff: true
    },
    orderBy: [
      { date: 'asc' },
      { timeSlot: 'asc' }
    ]
  });

  return NextResponse.json({ date, whereClause, count: appointments.length, appointments });
}
