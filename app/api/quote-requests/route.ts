import { NextResponse } from "next/server";

type RequestItem = { id?: unknown; slug?: unknown; name?: unknown; sku?: unknown; quantity?: unknown; observations?: unknown };
const WINDOW_MS = 60_000;
const LIMIT = 5;
const requests = new Map<string, { count: number; resetAt: number }>();

function text(value: unknown, max: number) { return typeof value === "string" ? value.trim().replace(/[<>]/g, "").slice(0, max) : ""; }

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now(); const bucket = requests.get(ip);
  if (bucket && bucket.resetAt > now && bucket.count >= LIMIT) return NextResponse.json({ error: "Demasiadas solicitudes; inténtalo de nuevo en un minuto." }, { status: 429 });
  requests.set(ip, { count: bucket && bucket.resetAt > now ? bucket.count + 1 : 1, resetAt: now + WINDOW_MS });
  let payload: Record<string, unknown>;
  try { payload = await request.json() as Record<string, unknown>; } catch { return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 }); }
  const customerName = text(payload.customerName, 120); const email = text(payload.email, 160); const phone = text(payload.phone, 40);
  const rawItems = Array.isArray(payload.items) ? payload.items as RequestItem[] : [];
  const items = rawItems.map((item) => ({ product_id: text(item.id, 100) || null, slug: text(item.slug, 160), name: text(item.name, 200), sku: text(item.sku, 100) || null, quantity: Math.max(1, Math.min(100000, Number(item.quantity) || 1)), observations: text(item.observations, 1000) || null })).filter((item) => item.name && item.slug);
  if (!customerName || !email.includes("@") || !phone || !items.length) return NextResponse.json({ error: "Completa nombre, correo, teléfono y al menos un concepto." }, { status: 400 });
  const requestNumber = `SOL-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "El canal de solicitudes formales aún no está configurado. Puedes enviar tu solicitud por WhatsApp." }, { status: 503 });
  const record = { request_number: requestNumber, customer_name: customerName, company: text(payload.company, 160) || null, email, phone, rfc: text(payload.rfc, 20) || null, general_notes: [text(payload.generalNote, 3000), text(payload.comments, 3000)].filter(Boolean).join("\n\n") || null, cart_snapshot: { items } };
  const response = await fetch(`${url}/rest/v1/quote_requests`, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify(record), cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: "No fue posible guardar la solicitud. Inténtalo por WhatsApp o más tarde." }, { status: 502 });
  return NextResponse.json({ requestNumber }, { status: 201 });
}
