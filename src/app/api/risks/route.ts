import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { validateRisk } from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function GET() {
  const risks = await db.list();
  return Response.json(risks);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const result = validateRisk(body);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  const risk = await db.create(result.data);
  return Response.json(risk, { status: 201 });
}
