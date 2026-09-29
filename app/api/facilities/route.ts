import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ facilities: [] });
}

export async function POST() {
  return NextResponse.json({ message: "Facility creation endpoint" }, { status: 501 });
}
