import { NextResponse } from "next/server";
import { checkPocketBaseHealth } from "@/lib/pocketbase";

export async function GET() {
  const health = await checkPocketBaseHealth();

  return NextResponse.json(health, {
    status: health.reachable ? 200 : 503,
  });
}
