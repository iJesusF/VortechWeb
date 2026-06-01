import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!name || !email) {
    return NextResponse.json({ message: "Nombre y email son requeridos." }, { status: 400 });
  }

  return NextResponse.json(
    {
      message: "Solicitud recibida en modo placeholder. Conecta aquí Resend, EmailJS u otro proveedor.",
    },
    { status: 202 },
  );
}
