import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();
    const { status, arrivalTime, serviceStartTime, serviceEndTime } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (arrivalTime) updateData.arrivalTime = new Date(arrivalTime);
    if (serviceStartTime) updateData.serviceStartTime = new Date(serviceStartTime);
    if (serviceEndTime) updateData.serviceEndTime = new Date(serviceEndTime);

    // Check-In flow logic
    if (status === "CHECKED_IN" && !arrivalTime) {
      updateData.arrivalTime = new Date();
    } else if (status === "IN_PROGRESS" && !serviceStartTime) {
      updateData.serviceStartTime = new Date();
    } else if (status === "COMPLETED" && !serviceEndTime) {
      updateData.serviceEndTime = new Date();
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        service: true,
        staff: true
      }
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Delete related payment if exists to avoid foreign key constraint issues
    await prisma.payment.deleteMany({
      where: { appointmentId: id }
    });

    await prisma.appointment.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
