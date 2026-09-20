import { NextResponse } from "next/server";
import { getRates } from "@/lib/services/fx";

// Public, cached: units of each supported currency per 1 USD.
export async function GET() {
  const { rates, live } = await getRates();
  return NextResponse.json(
    { success: true, data: { rates, live } },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
