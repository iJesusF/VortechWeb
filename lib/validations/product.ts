import { z } from "zod";

export const priceModes = ["request_quote", "fixed", "from", "hidden"] as const;
export const discountTypes = ["none", "fixed", "percentage"] as const;

export const productSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre es obligatorio").max(200, "Máximo 200 caracteres"),
    slug: z
      .string()
      .trim()
      .min(1, "El slug es obligatorio")
      .max(250, "Máximo 250 caracteres")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa minúsculas, números y guiones"),
    sku: z.string().trim().max(50, "Máximo 50 caracteres").nullable(),
    category_id: z.string().uuid("Selecciona una categoría válida"),
    short_description: z.string().trim().max(300, "Máximo 300 caracteres").nullable(),
    description: z.string().trim().max(10000, "Máximo 10,000 caracteres").nullable(),
    specifications: z.record(z.string(), z.string().max(500, "Máximo 500 caracteres por valor")),
    price_mode: z.enum(priceModes),
    price: z.number().nonnegative("El precio no puede ser negativo").nullable(),
    currency: z.string().trim().min(3).max(3),
    unit: z.string().trim().min(1, "La unidad es obligatoria").max(50),
    discount_type: z.enum(discountTypes),
    discount_value: z.number().nonnegative("El descuento no puede ser negativo"),
    tax_rate: z.number().min(0, "El IVA no puede ser negativo").max(1, "El IVA no puede exceder 100%"),
    is_active: z.boolean(),
    is_featured: z.boolean(),
    sort_order: z.number().int().min(0, "El orden no puede ser negativo"),
    whatsapp_message_override: z.string().trim().max(500, "Máximo 500 caracteres").nullable(),
  })
  .superRefine((data, ctx) => {
    if ((data.price_mode === "fixed" || data.price_mode === "from") && (!data.price || data.price <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["price"],
        message: "El precio debe ser mayor que cero para este modo",
      });
    }
    if (data.discount_type === "percentage" && data.discount_value > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discount_value"],
        message: "El porcentaje no puede exceder 100%",
      });
    }
    if (data.discount_type === "fixed" && data.price && data.discount_value > data.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discount_value"],
        message: "El descuento no puede ser mayor que el precio",
      });
    }
  });

export const imageFileSchema = z.object({
  type: z.enum(["image/jpeg", "image/png", "image/webp", "image/avif"]),
  size: z.number().max(5 * 1024 * 1024, "La imagen no debe exceder 5 MB"),
});

export type ProductFormData = z.infer<typeof productSchema>;
