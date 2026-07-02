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
    const search = searchParams.get('search');

    let whereClause = {};
    if (search) {
      whereClause = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
        ]
      };
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        appointments: {
          orderBy: { date: 'desc' },
          take: 1
        }
      }
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
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
    const { name, phone, email, gender, dob, address, notes, membershipYears } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Name and Phone are required" }, { status: 400 });
    }

    const existingCustomer = await prisma.customer.findUnique({
      where: { phone }
    });

    if (existingCustomer) {
      return NextResponse.json({ error: "Customer with this phone number already exists" }, { status: 400 });
    }

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

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email,
        gender,
        dob: dob ? new Date(dob) : null,
        address,
        notes,
        isMember,
        membershipStartDate,
        membershipEndDate,
        membershipYears: parsedYears
      }
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

