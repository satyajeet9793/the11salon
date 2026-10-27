export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    
    let targetDate = new Date();
    if (dateParam) {
      const parts = dateParam.split('-');
      if (parts.length === 3) {
        targetDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        const parsed = new Date(dateParam);
        if (!isNaN(parsed.getTime())) targetDate = parsed;
      }
    }

    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);
    const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 });
    const monthStart = startOfMonth(targetDate);
    const monthEnd = endOfMonth(targetDate);

    const targetYMD = format(targetDate, 'yyyy-MM-dd');
    const targetYM = format(targetDate, 'yyyy-MM');

    const staff = await prisma.staff.findMany({
      orderBy: { name: 'asc' },
      include: {
        appointments: {
          where: { status: 'COMPLETED' },
          include: {
            service: true,
            payment: true,
            customer: true
          },
          orderBy: { date: 'desc' }
        }
      }
    });

    const staffWithMetrics = staff.map(member => {
      let dayRevenue = 0;
      let dayCount = 0;
      let weekRevenue = 0;
      let weekCount = 0;
      let monthRevenue = 0;
      let monthCount = 0;
      let totalRevenue = 0;
      let totalCount = member.appointments.length;

      for (const apt of member.appointments) {
        const aptDate = new Date(apt.date);
        const aptYMD = format(aptDate, 'yyyy-MM-dd');
        const aptYM = format(aptDate, 'yyyy-MM');

        const amount = apt.payment?.amount ?? (apt.customPrice !== null ? apt.customPrice : (apt.service?.price ?? 0));
        totalRevenue += amount;

        // Day match
        if ((aptDate >= dayStart && aptDate <= dayEnd) || aptYMD === targetYMD) {
          dayRevenue += amount;
          dayCount++;
        }

        // Week match
        if (aptDate >= weekStart && aptDate <= weekEnd) {
          weekRevenue += amount;
          weekCount++;
        }

        // Month match
        if ((aptDate >= monthStart && aptDate <= monthEnd) || aptYM === targetYM) {
          monthRevenue += amount;
          monthCount++;
        }
      }

      return {
        ...member,
        business: {
          day: dayRevenue,
          dayCount,
          week: weekRevenue,
          weekCount,
          month: monthRevenue,
          monthCount,
          total: totalRevenue,
          totalCount
        }
      };
    });

    return NextResponse.json(staffWithMetrics);
  } catch (error) {
    console.error("Error fetching staff:", error);
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
    const { name, role, phone, salary, joiningDate, skills, isAvailable } = body;

    const staff = await prisma.staff.create({
      data: {
        name,
        role,
        phone,
        salary: salary ? parseFloat(salary) : null,
        joiningDate: joiningDate ? new Date(joiningDate) : null,
        skills,
        isAvailable: isAvailable ?? true
      }
    });

    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    console.error("Error creating staff:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

