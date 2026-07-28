const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const SUPPORTED_TYPES = new Set(["image/png", "image/jpeg"]);

export async function loadPdfLogo(url?: string | null): Promise<Buffer | undefined> {
  if (!url) return undefined;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    console.error("[quote-pdf]", { event: "invalid_logo_url" });
    return undefined;
  }
  if (parsedUrl.protocol !== "https:") {
    console.error("[quote-pdf]", { event: "insecure_logo_url" });
    return undefined;
  }

  try {
    const response = await fetch(parsedUrl, {
      signal: AbortSignal.timeout(5_000),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("[quote-pdf]", {
        event: "logo_download_failed",
        status: response.status,
      });
      return undefined;
    }

    const contentType = response.headers.get("content-type")?.split(";")[0];
    const contentLength = Number(response.headers.get("content-length") ?? "0");
    if (!contentType || !SUPPORTED_TYPES.has(contentType)) {
      console.error("[quote-pdf]", { event: "unsupported_logo_type", contentType });
      return undefined;
    }
    if (contentLength > MAX_LOGO_BYTES) {
      console.error("[quote-pdf]", { event: "logo_too_large", contentLength });
      return undefined;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length === 0 || buffer.length > MAX_LOGO_BYTES) {
      console.error("[quote-pdf]", { event: "invalid_logo_size", size: buffer.length });
      return undefined;
    }
    return buffer;
  } catch (error) {
    console.error("[quote-pdf]", {
      event: "logo_download_error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return undefined;
  }
}
