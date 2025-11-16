import { NextRequest, NextResponse } from "next/server";
import { appendFileSync } from "fs";
import { resolve } from "path";

const LOG_PATH = resolve(process.env.HUMAN_LOG ?? "/Users/petermason/secure_logs/manual-control.log");

function logAction(action: string, meta: Record<string, unknown>) {
  const line = JSON.stringify({ action, ...meta, timestamp: new Date().toISOString() });
  appendFileSync(LOG_PATH, line + "\n", { mode: 0o600 });
}

function ensureTrustee(req: NextRequest) {
  const trustee = req.headers.get("x-trustee");
  if (!trustee) throw new Error("Trustee oversight required");
  return trustee;
}

export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();
    if (!action) return NextResponse.json({ error: "Missing action" }, { status: 400 });

    const trustee = ensureTrustee(req);
    logAction(action, { trustee });
    return NextResponse.json({ message: `${action} logged` });
  } catch (err: any) {
    logAction("error", { reason: err.message });
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
