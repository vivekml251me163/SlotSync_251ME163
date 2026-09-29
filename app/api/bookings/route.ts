import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ bookings: [] });
}

export async function POST() {
  return NextResponse.json({ message: "Booking creation endpoint" }, { status: 501 });
}
