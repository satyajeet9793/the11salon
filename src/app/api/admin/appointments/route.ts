export const dynamic = 'force-dynamic';
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
    const customerId = searchParams.get('customerId');
    const staffId = searchParams.get('staffId');

    let whereClause: any = {};
    
    if (date) {
      const parsedDate = new Date(date);
      const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));
      
      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay
      };
    }
    
    if (customerId) {
      whereClause.customerId = customerId;
    }
    
    if (staffId) {
      whereClause.staffId = staffId;
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
    let { customerId, customerName, customerPhone, customerDob, serviceIds, serviceId, staffId, date, timeSlot, notes, membershipYears, customPrice } = body;

    // Support both single serviceId (legacy) and serviceIds (array)
    const servicesToCreate = serviceIds || (serviceId ? [serviceId] : []);
    if (servicesToCreate.length === 0) {
      return NextResponse.json({ error: "At least one service must be selected" }, { status: 400 });
    }

    let dobDate = customerDob ? new Date(customerDob) : null;

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
            dob: dobDate,
            isMember,
            membershipStartDate,
            membershipEndDate,
            membershipYears: parsedYears
          } 
        });
      } else if (dobDate) {
        // Update DOB if provided and customer already exists
        customer = await prisma.customer.update({
          where: { id: customer.id },
          data: { dob: dobDate }
        });
      }
      customerId = customer.id;
    } else if (customerId && dobDate) {
      // Update DOB if customerId is explicitly provided
      await prisma.customer.update({
        where: { id: customerId },
        data: { dob: dobDate }
      });
    }

    if (!customerId) return NextResponse.json({ error: "Customer details missing" }, { status: 400 });

    const createdAppointments = [];
    let isFirstAppointment = true;
    const parsedCustomPrice = customPrice !== undefined && customPrice !== null && customPrice !== "" ? parseFloat(customPrice) : null;

    for (const sid of servicesToCreate) {
      const service = await prisma.service.findUnique({ where: { id: sid } });
      if (!service) continue; // Skip invalid services

      let appliedCustomPrice = null;
      if (parsedCustomPrice !== null) {
        if (isFirstAppointment) {
          appliedCustomPrice = parsedCustomPrice;
          isFirstAppointment = false;
        } else {
          appliedCustomPrice = 0;
        }
      }

      const appointment = await prisma.appointment.create({
        data: {
          date: new Date(date),
          timeSlot,
          duration: service.duration,
          status: "CHECKED_IN",
          notes,
          customPrice: appliedCustomPrice,
          customerId,
          serviceId: sid,
          staffId: staffId || null,
        },
        include: {
          customer: true,
          service: true,
          staff: true
        }
      });
      createdAppointments.push(appointment);
    }

    if (createdAppointments.length === 0) {
      return NextResponse.json({ error: "No valid services found" }, { status: 404 });
    }

    return NextResponse.json(createdAppointments, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

