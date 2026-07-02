import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, endOfDay, subMonths, startOfMonth } from "date-fns";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const timeSpan = searchParams.get('timeSpan');
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');

    let startDate: Date;
    let endDate: Date;

    if (timeSpan) {
      const now = new Date();
      endDate = endOfDay(now);
      if (timeSpan === 'week') {
        startDate = startOfDay(subDays(now, 6));
      } else if (timeSpan === 'month') {
        startDate = startOfDay(subDays(now, 29));
      } else if (timeSpan === '6months') {
        startDate = startOfMonth(subMonths(now, 5));
      } else {
        startDate = startOfDay(now); // today
      }
    } else if (startParam && endParam) {
      startDate = new Date(startParam);
      endDate = new Date(endParam);
    } else {
      return NextResponse.json({ error: "Missing time parameters" }, { status: 400 });
    }

    // 1. Fetch Invoices (Revenue)
    const invoices = await prisma.payment.findMany({
      where: {
        status: "PAID",
        createdAt: {
          gte: startDate,
          lte: endDate,
        }
      },
      include: {
        appointment: {
          include: {
            customer: true,
            service: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 2. Fetch Pending Appointments
    const pendingAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: { in: ["BOOKED", "CHECKED_IN", "IN_PROGRESS"] }
      },
      include: {
        customer: true,
        service: true,
        staff: true
      },
      orderBy: [
        { date: 'desc' },
        { timeSlot: 'desc' }
      ]
    });

    // 3. Fetch Completed Appointments
    const completedAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: "COMPLETED"
      },
      include: {
        customer: true,
        service: true,
        staff: true
      },
      orderBy: [
        { date: 'desc' },
        { timeSlot: 'desc' }
      ]
    });

    // 4. Fetch New Customers
    const newCustomers = await prisma.customer.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ 
      invoices, 
      pendingAppointments, 
      completedAppointments, 
      newCustomers 
    });
  } catch (error) {
    console.error("Error fetching dashboard details:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
