import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoices = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        appointment: {
          include: {
            customer: true,
            service: true
          }
        }
      }
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
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
    const { appointmentId, customerId, serviceId, amount, method, status } = body;

    let finalApptId = appointmentId;

    // If no appointmentId is provided, we are creating a direct standalone invoice.
    // We must create a COMPLETED appointment on the fly to satisfy the DB schema.
    if (!finalApptId) {
      if (!customerId || !serviceId) {
        return NextResponse.json({ error: "Customer ID and Service ID are required for direct billing." }, { status: 400 });
      }

      const newAppt = await prisma.appointment.create({
        data: {
          date: new Date(),
          timeSlot: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          duration: 0,
          status: "COMPLETED",
          customerId,
          serviceId,
          notes: "Auto-generated for direct billing."
        }
      });
      finalApptId = newAppt.id;
    }

    const payment = await prisma.payment.create({
      data: {
        appointmentId: finalApptId,
        amount: parseFloat(amount),
        method: method || "CASH",
        status: status || "PAID"
      },
      include: {
        appointment: {
          include: {
            customer: true,
            service: true
          }
        }
      }
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
