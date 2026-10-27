import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const aliveCheck = await prisma.$queryRaw`SELECT 1 as alive`;
    const serviceCount = await prisma.service.count();

    return NextResponse.json({
      status: "ok",
      message: "Database pinged successfully. Supabase stay-alive trigger active.",
      timestamp: new Date().toISOString(),
      serviceCount,
      aliveCheck
    });
  } catch (error: any) {
    console.error("Keep-alive error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to query database" },
      { status: 500 }
    );
  }
}
