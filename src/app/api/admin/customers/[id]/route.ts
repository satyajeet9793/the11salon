import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: any
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // 1. Find all appointments for this customer
    const appointments = await prisma.appointment.findMany({
      where: { customerId: id },
      select: { id: true }
    });
    
    const appointmentIds = appointments.map(a => a.id);

    // 2. Delete all payments associated with these appointments
    if (appointmentIds.length > 0) {
      await prisma.payment.deleteMany({
        where: { appointmentId: { in: appointmentIds } }
      });

      // 3. Delete all appointments for this customer
      await prisma.appointment.deleteMany({
        where: { customerId: id }
      });
    }

    // 4. Finally, delete the customer
    await prisma.customer.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
