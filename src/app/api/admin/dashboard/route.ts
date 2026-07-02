import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, endOfDay, format, addDays, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval, eachHourOfInterval, setHours } from "date-fns";

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
    const timeSpan = searchParams.get('timeSpan') || 'today'; // today, week, month, 6months

    const now = new Date();
    let startDate = startOfDay(now);
    let endDate = endOfDay(now);

    if (timeSpan === 'week') {
      startDate = startOfDay(subDays(now, 6)); // Last 7 days
    } else if (timeSpan === 'month') {
      startDate = startOfDay(subDays(now, 29)); // Last 30 days
    } else if (timeSpan === '6months') {
      startDate = startOfMonth(subMonths(now, 5)); // Last 6 months
    }

    // 1. New Customers
    const newCustomers = await prisma.customer.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        }
      }
    });

    // 2. Pending Appointments in timespan
    const pendingAppointments = await prisma.appointment.count({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: { in: ["BOOKED", "CHECKED_IN", "IN_PROGRESS"] }
      }
    });

    // 2b. Completed Appointments in timespan
    const completedAppointmentsInSpan = await prisma.appointment.count({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: "COMPLETED"
      }
    });

    // 3. Total Revenue (sum of PAID payments in timespan)
    const payments = await prisma.payment.findMany({
      where: { 
        status: "PAID",
        createdAt: {
          gte: startDate,
          lte: endDate,
        }
      }
    });
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // 4. Upcoming Appointments (limit 5, from today onwards regardless of timespan to be useful)
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        date: { gte: startOfDay(now) },
        status: { in: ["BOOKED", "CHECKED_IN"] }
      },
      orderBy: [
        { date: 'asc' },
        { timeSlot: 'asc' }
      ],
      take: 5,
      include: { customer: true, service: true, staff: true }
    });

    // 5. Chart Data (Dynamic based on timespan)
    const chartData: any[] = [];
    
    // Fetch all relevant appointments and payments for chart to do in-memory grouping
    const chartApps = await prisma.appointment.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        status: { notIn: ["CANCELLED"] }
      },
      include: { service: true }
    });

    const chartPayments = await prisma.payment.findMany({
      where: {
        status: "PAID",
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    if (timeSpan === 'today') {
      // Group by working hours (e.g., 9 AM to 9 PM)
      const hours = eachHourOfInterval({ start: setHours(now, 9), end: setHours(now, 21) });
      hours.forEach(hour => {
        const hourStart = hour;
        const hourEnd = new Date(hour.getTime() + 60 * 60 * 1000 - 1);
        
        const appsInHour = chartApps.filter(a => a.date >= hourStart && a.date <= hourEnd);
        const paymentsInHour = chartPayments.filter(p => p.createdAt >= hourStart && p.createdAt <= hourEnd);
        const revenue = paymentsInHour.reduce((sum, p) => sum + p.amount, 0);
        
        chartData.push({
          name: format(hour, 'h a'), // 9 AM
          revenue,
          appointments: appsInHour.length,
          dateStart: hourStart.toISOString(),
          dateEnd: hourEnd.toISOString()
        });
      });
    } else if (timeSpan === 'week' || timeSpan === 'month') {
      // Group by day
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      days.forEach(day => {
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);
        
        const appsInDay = chartApps.filter(a => a.date >= dayStart && a.date <= dayEnd);
        const paymentsInDay = chartPayments.filter(p => p.createdAt >= dayStart && p.createdAt <= dayEnd);
        const revenue = paymentsInDay.reduce((sum, p) => sum + p.amount, 0);
        
        chartData.push({
          name: timeSpan === 'week' ? format(day, 'E') : format(day, 'MMM d'), // Mon or Jan 1
          revenue,
          appointments: appsInDay.length,
          dateStart: dayStart.toISOString(),
          dateEnd: dayEnd.toISOString()
        });
      });
    } else if (timeSpan === '6months') {
      // Group by month
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      months.forEach(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const appsInMonth = chartApps.filter(a => a.date >= monthStart && a.date <= monthEnd);
        const paymentsInMonth = chartPayments.filter(p => p.createdAt >= monthStart && p.createdAt <= monthEnd);
        const revenue = paymentsInMonth.reduce((sum, p) => sum + p.amount, 0);
        
        chartData.push({
          name: format(month, 'MMM'), // Jan
          revenue,
          appointments: appsInMonth.length,
          dateStart: monthStart.toISOString(),
          dateEnd: monthEnd.toISOString()
        });
      });
    }

    // Determine performance trend (mock trend)
    const performance = totalRevenue > 0 ? "98.5%" : "0%";

    // 6. Expiring Memberships (next 30 days or already expired recently)
    const thirtyDaysFromNow = addDays(new Date(), 30);
    const expiringMemberships = await prisma.customer.findMany({
      where: {
        isMember: true,
        membershipEndDate: {
          lte: thirtyDaysFromNow
        }
      },
      orderBy: {
        membershipEndDate: 'asc'
      },
      take: 5
    });

    return NextResponse.json({
      revenue: totalRevenue,
      customers: newCustomers,
      pendingAppointments: pendingAppointments,
      completedAppointments: completedAppointmentsInSpan,
      performance: performance,
      chartData: chartData,
      upcomingAppointments: upcomingAppointments,
      expiringMemberships: expiringMemberships
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
