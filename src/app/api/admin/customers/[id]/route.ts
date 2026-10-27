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

export async function PATCH(
  req: NextRequest,
  { params }: any
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, phone, email, gender, dob, address, notes, membershipYears } = body;

    let cleanPhone = phone ? phone.toString().trim().replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '').replace(/^0(?=\d{10}$)/, '') : undefined;

    // If phone changed, verify uniqueness
    if (cleanPhone) {
      const existing = await prisma.customer.findUnique({
        where: { phone: cleanPhone }
      });
      if (existing && existing.id !== id) {
        return NextResponse.json({ error: "Another customer with this phone number already exists" }, { status: 400 });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (cleanPhone !== undefined) updateData.phone = cleanPhone;
    if (email !== undefined) updateData.email = email ? email.trim() : null;
    if (gender !== undefined) updateData.gender = gender || null;
    if (dob !== undefined) updateData.dob = dob ? new Date(dob) : null;
    if (address !== undefined) updateData.address = address ? address.trim() : null;
    if (notes !== undefined) updateData.notes = notes ? notes.trim() : null;

    if (membershipYears !== undefined) {
      const parsedYears = membershipYears ? parseInt(membershipYears) : null;
      if (parsedYears && parsedYears > 0) {
        updateData.isMember = true;
        updateData.membershipYears = parsedYears;
        updateData.membershipStartDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + parsedYears);
        updateData.membershipEndDate = endDate;
      } else if (parsedYears === 0 || membershipYears === "") {
        updateData.isMember = false;
        updateData.membershipYears = null;
        updateData.membershipStartDate = null;
        updateData.membershipEndDate = null;
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

