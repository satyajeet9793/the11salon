import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, notes, serviceId, date, time } = body;

    if (!name || !phone || !serviceId || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Find or create the customer
    let customer = await prisma.customer.findUnique({
      where: { phone }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: { name, phone }
      });
    } else {
      // Update name if different and increment visit count? 
      // Actually we'll increment visit count on completion.
      if (customer.name !== name) {
        customer = await prisma.customer.update({
          where: { id: customer.id },
          data: { name }
        });
      }
    }

    // 2. Get Service Duration
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    // 3. Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        timeSlot: time,
        duration: service.duration,
        status: "BOOKED",
        notes,
        customerId: customer.id,
        serviceId: service.id,
      }
    });

    // 4. Create an Admin Notification
    await prisma.notification.create({
      data: {
        type: "ADMIN_ALERT",
        recipient: "ADMIN",
        content: `New booking received from ${name} for ${service.name} on ${date} at ${time}.`,
        status: "UNREAD"
      }
    });

    return NextResponse.json({ success: true, appointmentId: appointment.id }, { status: 201 });
  } catch (error) {
    console.error("Error processing booking:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
