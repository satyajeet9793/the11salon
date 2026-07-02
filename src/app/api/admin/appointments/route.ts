import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    let { customerId, customerName, customerPhone, serviceId, staffId, date, timeSlot, notes, membershipYears } = body;

    if (!customerId && customerName && customerPhone) {
      let customer = await prisma.customer.findUnique({ where: { phone: customerPhone } });
      if (!customer) {
        let isMember = false;
        let membershipStartDate = null;
        let membershipEndDate = null;
        let parsedYears = membershipYears ? parseInt(membershipYears) : null;
        
        if (parsedYears && parsedYears > 0) {
          isMember = true;
          membershipStartDate = new Date();
          membershipEndDate = new Date();
          membershipEndDate.setFullYear(membershipEndDate.getFullYear() + parsedYears);
        }

        customer = await prisma.customer.create({ 
          data: { 
            name: customerName, 
            phone: customerPhone,
            isMember,
            membershipStartDate,
            membershipEndDate,
            membershipYears: parsedYears
          } 
        });
      }
      customerId = customer.id;
    }

    if (!customerId) return NextResponse.json({ error: "Customer details missing" }, { status: 400 });

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        timeSlot,
        duration: service.duration,
        status: "CHECKED_IN",
        notes,
        customerId,
        serviceId,
        staffId: staffId || null,
      },
      include: {
        customer: true,
        service: true,
        staff: true
      }
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
