import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200, "Máximo 200 caracteres"),
  slug: z
    .string()
    .min(1, "El slug es requerido")
    .max(250, "Máximo 250 caracteres")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Solo letras minúsculas, números y guiones"),
  sku: z.string().max(50, "Máximo 50 caracteres").nullable().optional(),
  category_id: z.string().uuid("Categoría inválida"),
  short_description: z.string().min(1, "La descripción corta es requerida").max(300, "Máximo 300 caracteres"),
  description: z.string().min(1, "La descripción es requerida"),
  specifications: z.record(z.string(), z.string()).default({}),
  price_mode: z.enum(["request_quote", "fixed", "from", "hidden"]).default("request_quote"),
  price: z.number().positive("El precio debe ser positivo").nullable().optional(),
  currency: z.string().default("MXN"),
  is_active: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  sort_order: z.number().int().min(0).default(0),
  whatsapp_message_override: z.string().max(500, "Máximo 500 caracteres").nullable().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const imageFileSchema = z.object({
  type: z.string().refine(
    (type) => ["image/jpeg", "image/png", "image/webp", "image/avif"].includes(type),
    "Solo se permiten archivos JPG, PNG, WebP o AVIF"
  ),
  size: z.number().max(5 * 1024 * 1024, "El archivo no debe exceder 5MB"),
});

export type ImageFileValidation = z.infer<typeof imageFileSchema>;
