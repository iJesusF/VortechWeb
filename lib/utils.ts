/**
 * Generate a URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Remove consecutive hyphens
}

/**
 * Validate an image file for upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  const maxSize = Number(process.env.NEXT_PUBLIC_MAX_IMAGE_SIZE) || 5242880; // 5MB default

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Solo se permiten archivos JPG, PNG, WebP o AVIF.",
    };
  }

  if (file.size > maxSize) {
    const maxMB = (maxSize / 1024 / 1024).toFixed(1);
    return {
      valid: false,
      error: `El archivo excede el tamaño máximo de ${maxMB} MB.`,
    };
  }

  return { valid: true };
}

/**
 * Generate a unique file name for storage
 */
export function generateUniqueFileName(originalName: string): string {
  const ext = originalName.split(".").pop()?.toLowerCase() || "jpg";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}.${ext}`;
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = "MXN"): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
