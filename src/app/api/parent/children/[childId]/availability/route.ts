import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Availability } from "@/models/availability";

// POST: Create or update availability
export async function POST(req: Request, { params }: { params: { childId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "parent") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const body = await req.json();
  const { days, validFrom, validTo, timezone } = body;

  if (!Array.isArray(days) || !validFrom || !validTo || !timezone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Enrich slots with startDisplay/endDisplay if not present
  const enrichedDays = days.map((d: any) => ({
    ...d,
    slots: (d.slots || []).map((slot: any) => ({
      ...slot,
      startDisplay: slot.startDisplay || slot.start,
      endDisplay: slot.endDisplay || slot.end
    }))
  }));

  const availability = await Availability.findOneAndUpdate(
    { childId: params.childId },
    {
      childId: params.childId,
      parentId: session.user.id,
      timezone,
      days: enrichedDays,
      validFrom: new Date(validFrom),
      validTo: new Date(validTo)
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return NextResponse.json({ success: true, availability });
}

// GET: Get availability for a child (open to all roles)
export async function GET(req: Request, { params }: { params: { childId: string } }) {
  await connectDB();
  const availability = await Availability.findOne({ childId: params.childId });
  if (!availability) {
    return NextResponse.json({ error: "No availability found" }, { status: 404 });
  }
  return NextResponse.json(availability);
}
