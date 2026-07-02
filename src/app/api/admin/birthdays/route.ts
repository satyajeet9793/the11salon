export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    // Fetch all customers with a recorded date of birth
    const customers = await prisma.customer.findMany({
      where: {
        dob: {
          not: null
        }
      }
    });

    // Filter for birthdays matching today's month and day
    const birthdays = customers.filter(customer => {
      if (!customer.dob) return false;
      const dob = new Date(customer.dob);
      return dob.getMonth() + 1 === currentMonth && dob.getDate() === currentDay;
    });

    return NextResponse.json(birthdays);
  } catch (error) {
    console.error("Failed to fetch birthdays:", error);
    return NextResponse.json({ error: "Failed to fetch birthdays" }, { status: 500 });
  }
}

