import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { dob: { not: null } },
          { membershipEndDate: { not: null } }
        ]
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const todayMonth = today.getMonth();
    const todayDate = today.getDate();
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999); // End of 7th day

    const alerts: any[] = [];

    customers.forEach(customer => {
      // Check Birthday
      if (customer.dob) {
        const dob = new Date(customer.dob);
        if (dob.getMonth() === todayMonth && dob.getDate() === todayDate) {
          alerts.push({
            id: `bday-${customer.id}`,
            type: "BIRTHDAY",
            title: "Birthday Alert",
            message: `Today is ${customer.name}'s birthday!`,
            customerId: customer.id,
            name: customer.name,
            phone: customer.phone,
            date: today.toISOString()
          });
        }
      }

      // Check Membership Expiry
      if (customer.membershipEndDate) {
        const expiry = new Date(customer.membershipEndDate);
        if (expiry >= today && expiry <= nextWeek) {
          const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
          alerts.push({
            id: `exp-${customer.id}`,
            type: "MEMBERSHIP",
            title: "Membership Expiring",
            message: `${customer.name}'s membership expires ${daysLeft === 0 ? 'today' : 'in ' + daysLeft + ' day(s)'}.`,
            customerId: customer.id,
            name: customer.name,
            phone: customer.phone,
            date: expiry.toISOString()
          });
        }
      }
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
