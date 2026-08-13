import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { STATUSES } from "@/lib/risk";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/risks/[id]">
) {
  const { id } = await ctx.params;
  const risk = await db.get(id);
  if (!risk) {
    return Response.json({ error: "Risk not found" }, { status: 404 });
  }
  return Response.json(risk);
}

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/risks/[id]">
) {
  const { id } = await ctx.params;
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const status = typeof body?.status === "string" ? body.status : "";
  const note = typeof body?.note === "string" ? body.note.trim() : "";
  const by = typeof body?.by === "string" ? body.by.trim() : "";

  if (!STATUSES.includes(status as never)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await db.addUpdate(id, {
    status: status as never,
    note,
    by: by || "Anonymous",
  });
  if (!updated) {
    return Response.json({ error: "Risk not found" }, { status: 404 });
  }
  return Response.json(updated);
}
