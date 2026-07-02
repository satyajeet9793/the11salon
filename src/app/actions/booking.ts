"use server";

import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function createBooking(data: {
  serviceId: string;
  staffId: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
}) {
  try {
    // 1. Find or create the customer
    let customer = await prisma.customer.findUnique({
      where: { phone: data.phone },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email || null,
        },
      });
    }

    // 2. Check if the slot is already booked for that staff member (if staff is selected)
    // For simplicity, we just check if any appointment exists at that date/time for that staff.
    if (data.staffId !== "any") {
      const existing = await prisma.appointment.findFirst({
        where: {
          date: new Date(data.date),
          timeSlot: data.time,
          staffId: data.staffId,
          status: { notIn: ["CANCELLED"] },
        },
      });

      if (existing) {
        return { success: false, error: "This time slot is already booked for the selected professional." };
      }
    }

    // 3. Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(data.date),
        timeSlot: data.time,
        status: "CONFIRMED",
        notes: data.notes,
        customerId: customer.id,
        serviceId: data.serviceId,
        staffId: data.staffId === "any" ? null : data.staffId,
      },
      include: { service: true }
    });

    // 4. Send WhatsApp Notification
    const serviceName = appointment.service?.name || "Service";
    const msg = `Hello ${data.name}! Your booking for ${serviceName} at The 11 Professional Family Salon is confirmed for ${data.date} at ${data.time}.\n\nLocation: Kolhapur\nWhatsApp/Call: +91 74474 88880`;
    await sendWhatsAppMessage(data.phone, msg);

    return { success: true, appointmentId: appointment.id };
  } catch (error) {
    console.error("Booking error:", error);
    return { success: false, error: "An error occurred while creating the booking." };
  }
}

export async function getServices() {
  try {
    const services = await prisma.service.findMany();
    return services;
  } catch (error) {
    console.error("Fetch services error:", error);
    return [];
  }
}

export async function getStaff() {
  try {
    const staff = await prisma.staff.findMany({
      where: { isAvailable: true }
    });
    return staff;
  } catch (error) {
    console.error("Fetch staff error:", error);
    return [];
  }
}

export async function getAvailableSlots(dateStr: string, staffId: string, serviceId: string) {
  try {
    const targetDate = new Date(dateStr);
    
    // 1. Check if date is a holiday
    const holiday = await prisma.holiday.findFirst({
      where: {
        date: {
          gte: new Date(targetDate.setHours(0,0,0,0)),
          lte: new Date(targetDate.setHours(23,59,59,999))
        }
      }
    });

    if (holiday) {
      return { success: true, slots: [], message: `Salon is closed: ${holiday.reason || 'Holiday'}` };
    }

    // 2. Get the requested service duration
    let serviceDuration = 60; // default 60 mins
    if (serviceId) {
      const service = await prisma.service.findUnique({ where: { id: serviceId } });
      if (service && service.duration) {
        serviceDuration = service.duration;
      }
    }

    // 3. Generate all possible 30-min interval slots between 10 AM and 8 PM
    const allSlots: { time: string, startMin: number }[] = [];
    let currentMin = 10 * 60; // 10:00 AM in minutes from midnight
    const endMin = 20 * 60;   // 8:00 PM in minutes from midnight

    while (currentMin + serviceDuration <= endMin) {
      const hours = Math.floor(currentMin / 60);
      const mins = currentMin % 60;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
      const timeStr = `${displayHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;
      
      allSlots.push({ time: timeStr, startMin: currentMin });
      currentMin += 30; // generate every 30 mins
    }

    // 4. Fetch existing appointments to block out times
    // For calculating conflicts, we need to know the duration of the existing appointments
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    let existingAppointments;
    if (staffId && staffId !== "any") {
      existingAppointments = await prisma.appointment.findMany({
        where: { 
          date: { gte: startOfDay, lte: endOfDay }, 
          staffId: staffId, 
          status: { notIn: ["CANCELLED"] } 
        },
        include: { service: true }
      });
    } else {
      existingAppointments = await prisma.appointment.findMany({
        where: { 
          date: { gte: startOfDay, lte: endOfDay }, 
          status: { notIn: ["CANCELLED"] } 
        },
        include: { service: true }
      });
    }

    // Convert existing appointments into blocked minute ranges
    const blockedRanges = existingAppointments.map(app => {
      // Parse timeSlot "10:30 AM" back to minutes
      const match = app.timeSlot.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return { start: 0, end: 0, staffId: app.staffId };
      let h = parseInt(match[1]);
      const m = parseInt(match[2]);
      const isPM = match[3].toUpperCase() === 'PM';
      if (isPM && h !== 12) h += 12;
      if (!isPM && h === 12) h = 0;
      
      const startMin = (h * 60) + m;
      const endMin = startMin + (app.service?.duration || 60);
      return { start: startMin, end: endMin, staffId: app.staffId };
    }).filter(range => range.end > 0);

    const totalStaff = await prisma.staff.count({ where: { isAvailable: true } });
    const effectiveTotalStaff = Math.max(1, totalStaff); // Default to at least 1 slot available if no staff added

    // 5. Filter slots that overlap with blocked ranges
    const freeSlots = allSlots.filter(slot => {
      const reqStart = slot.startMin;
      const reqEnd = reqStart + serviceDuration;

      if (staffId && staffId !== "any") {
        // For specific staff, they must not have any overlap
        const hasOverlap = blockedRanges.some(blocked => 
          reqStart < blocked.end && reqEnd > blocked.start && blocked.staffId === staffId
        );
        return !hasOverlap;
      } else {
        // Find how many distinct staff members are busy during this slot
        const busyStaffIds = new Set();
        let unassignedBusyCount = 0;

        for (const blocked of blockedRanges) {
          if (reqStart < blocked.end && reqEnd > blocked.start) {
            if (blocked.staffId) {
              busyStaffIds.add(blocked.staffId);
            } else {
              unassignedBusyCount++;
            }
          }
        }
        
        const totalBusy = busyStaffIds.size + unassignedBusyCount;
        return totalBusy < effectiveTotalStaff;
      }
    });

    return { success: true, slots: freeSlots.map(s => s.time) };
  } catch (error) {
    console.error("Fetch slots error:", error);
    return { success: false, slots: [], error: "Failed to fetch slots" };
  }
}

export async function joinWaitlist(data: { name: string; phone: string; email?: string; date: string; serviceId: string; staffId: string }) {
  try {
    const waitlist = await prisma.waitlist.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        date: new Date(data.date),
        serviceId: data.serviceId,
        staffId: data.staffId === "any" ? null : data.staffId,
        status: "WAITING"
      },
      include: { service: true }
    });

    const serviceName = waitlist.service?.name || "Service";
    const msg = `Hello ${data.name}, you have been added to the waitlist for ${serviceName} on ${data.date}. We will notify you if a slot becomes available!\n\n- The 11 Salon`;
    await sendWhatsAppMessage(data.phone, msg);

    return { success: true, waitlistId: waitlist.id };
  } catch (error) {
    console.error("Waitlist error:", error);
    return { success: false, error: "Failed to join waitlist" };
  }
}
