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

    const staff = await prisma.staff.findMany({
      orderBy: { name: 'asc' },
      include: {
        appointments: {
          where: { status: 'COMPLETED' }
        }
      }
    });

    return NextResponse.json(staff);
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

