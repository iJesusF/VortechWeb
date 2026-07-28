import { NextResponse } from "next/server";

export function createPdfResponse(
  buffer: Buffer,
  filename: string,
  disposition: "inline" | "attachment"
) {
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="${filename}"`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "private, no-store",
    },
  });
}
