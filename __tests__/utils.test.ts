import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateSlug, validateImageFile, generateUniqueFileName, formatPrice } from "@/lib/utils";

describe("generateSlug", () => {
  it("converts text to lowercase slug", () => {
    expect(generateSlug("Hello World")).toBe("hello-world");
  });

  it("removes diacritics", () => {
    expect(generateSlug("Válvula de presión")).toBe("valvula-de-presion");
  });

  it("removes special characters", () => {
    expect(generateSlug("PLC Siemens S7-1200")).toBe("plc-siemens-s7-1200");
  });

  it("handles multiple spaces", () => {
    expect(generateSlug("multiple   spaces   here")).toBe("multiple-spaces-here");
  });

  it("removes consecutive hyphens", () => {
    expect(generateSlug("test---multiple---hyphens")).toBe("test-multiple-hyphens");
  });

  it("handles empty string", () => {
    expect(generateSlug("")).toBe("");
  });

  it("handles accented characters", () => {
    expect(generateSlug("Ósmosis Inversa Módulo")).toBe("osmosis-inversa-modulo");
  });

  it("removes leading/trailing whitespace", () => {
    expect(generateSlug("  trimmed  ")).toBe("trimmed");
  });
});

describe("validateImageFile", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_MAX_IMAGE_SIZE", "5242880");
  });

  it("accepts valid JPEG file", () => {
    const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
    Object.defineProperty(file, "size", { value: 1024 * 1024 }); // 1MB
    expect(validateImageFile(file)).toEqual({ valid: true });
  });

  it("accepts valid PNG file", () => {
    const file = new File(["data"], "test.png", { type: "image/png" });
    Object.defineProperty(file, "size", { value: 2 * 1024 * 1024 }); // 2MB
    expect(validateImageFile(file)).toEqual({ valid: true });
  });

  it("accepts valid WebP file", () => {
    const file = new File(["data"], "test.webp", { type: "image/webp" });
    Object.defineProperty(file, "size", { value: 500 * 1024 }); // 500KB
    expect(validateImageFile(file)).toEqual({ valid: true });
  });

  it("accepts valid AVIF file", () => {
    const file = new File(["data"], "test.avif", { type: "image/avif" });
    Object.defineProperty(file, "size", { value: 300 * 1024 });
    expect(validateImageFile(file)).toEqual({ valid: true });
  });

  it("rejects GIF files", () => {
    const file = new File(["data"], "test.gif", { type: "image/gif" });
    Object.defineProperty(file, "size", { value: 1024 });
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("JPG, PNG, WebP o AVIF");
  });

  it("rejects SVG files", () => {
    const file = new File(["data"], "test.svg", { type: "image/svg+xml" });
    Object.defineProperty(file, "size", { value: 1024 });
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
  });

  it("rejects files that exceed max size", () => {
    const file = new File(["data"], "large.jpg", { type: "image/jpeg" });
    Object.defineProperty(file, "size", { value: 10 * 1024 * 1024 }); // 10MB
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("tamaño máximo");
  });

  it("rejects non-image files", () => {
    const file = new File(["data"], "doc.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "size", { value: 1024 });
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
  });
});

describe("generateUniqueFileName", () => {
  it("generates a unique filename with extension", () => {
    const name1 = generateUniqueFileName("photo.jpg");
    const name2 = generateUniqueFileName("photo.jpg");
    expect(name1).not.toBe(name2);
    expect(name1).toMatch(/^\d+-[a-z0-9]+\.jpg$/);
  });

  it("preserves the file extension in lowercase", () => {
    const name = generateUniqueFileName("IMAGE.PNG");
    expect(name).toMatch(/\.png$/);
  });

  it("handles files without extension", () => {
    const name = generateUniqueFileName("noext");
    expect(name).toMatch(/\.noext$/);
  });
});

describe("formatPrice", () => {
  it("formats MXN price", () => {
    const formatted = formatPrice(1500, "MXN");
    expect(formatted).toContain("1,500");
  });

  it("formats USD price", () => {
    const formatted = formatPrice(99.99, "USD");
    expect(formatted).toContain("99.99");
  });

  it("formats zero price", () => {
    const formatted = formatPrice(0, "MXN");
    expect(formatted).toContain("0");
  });
});
