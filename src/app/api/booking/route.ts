import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, notes, serviceIds, date, time } = body;

    if (!name || !phone || !serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0 || !date || !time) {
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
      if (customer.name !== name) {
        customer = await prisma.customer.update({
          where: { id: customer.id },
          data: { name }
        });
      }
    }

    // 2. Get Service Durations
    const services = await prisma.service.findMany({ where: { id: { in: serviceIds } } });
    if (services.length === 0) return NextResponse.json({ error: "Services not found" }, { status: 404 });

    // 3. Create the appointments in a transaction
    const appointmentsData = services.map(service => ({
      date: new Date(date),
      timeSlot: time,
      duration: service.duration,
      status: "BOOKED" as const,
      notes,
      customerId: customer.id,
      serviceId: service.id,
    }));

    await prisma.appointment.createMany({
      data: appointmentsData
    });

    // 4. Create an Admin Notification
    const serviceNames = services.map(s => s.name).join(", ");
    await prisma.notification.create({
      data: {
        type: "ADMIN_ALERT",
        recipient: "ADMIN",
        content: `New booking received from ${name} for ${serviceNames} on ${date} at ${time}.`,
        status: "UNREAD"
      }
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error processing booking:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
