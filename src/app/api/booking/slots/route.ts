export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parse, addMinutes, isBefore, isAfter, isEqual, startOfDay, endOfDay, format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date');
    const serviceId = searchParams.get('serviceId');

    if (!dateStr || !serviceId) {
      return NextResponse.json({ error: "Date and Service ID are required" }, { status: 400 });
    }

    const requestedDate = new Date(dateStr);
    const dayStart = startOfDay(requestedDate);
    const dayEnd = endOfDay(requestedDate);

    // Get service details for duration
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const serviceDuration = service.duration; // in minutes

    // Salon hours (e.g., 9:00 AM to 8:00 PM)
    // You can also pull this from Settings table in the future
    const salonOpenTime = parse("09:00", "HH:mm", requestedDate);
    const salonCloseTime = parse("20:00", "HH:mm", requestedDate);

    // Get all available staff
    const staff = await prisma.staff.findMany({
      where: { isAvailable: true }
    });

    const effectiveTotalStaff = Math.max(1, staff.length);

    // Get all appointments for the requested date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: dayStart,
          lte: dayEnd
        },
        status: {
          notIn: ["CANCELLED", "NO_SHOW"]
        }
      }
    });

    // Generate potential slots (every 30 minutes)
    const availableSlots = [];
    let currentSlotTime = salonOpenTime;

    while (isBefore(addMinutes(currentSlotTime, serviceDuration), salonCloseTime) || isEqual(addMinutes(currentSlotTime, serviceDuration), salonCloseTime)) {
      const slotStartTime = currentSlotTime;
      const slotEndTime = addMinutes(currentSlotTime, serviceDuration);
      
      const busyStaffIds = new Set();
      let unassignedBusyCount = 0;

      for (const app of existingAppointments) {
        const appStart = parse(app.timeSlot, "hh:mm a", requestedDate);
        const appEnd = addMinutes(appStart, app.duration || 60);

        if (isBefore(slotStartTime, appEnd) && isAfter(slotEndTime, appStart)) {
          if (app.staffId) {
            busyStaffIds.add(app.staffId);
          } else {
            unassignedBusyCount++;
          }
        }
      }

      const totalBusy = busyStaffIds.size + unassignedBusyCount;
      
      if (totalBusy < effectiveTotalStaff) {
        availableSlots.push({
          time: format(slotStartTime, "hh:mm a"),
          available: true
        });
      }

      // Increment by 30 mins
      currentSlotTime = addMinutes(currentSlotTime, 30);
    }

    return NextResponse.json({ slots: availableSlots });
  } catch (error) {
    console.error("Error calculating slots:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

