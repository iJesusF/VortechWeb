import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(100, "Máximo 100 caracteres"),
  slug: z
    .string()
    .trim()
    .min(1, "El slug es obligatorio")
    .max(120, "Máximo 120 caracteres")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa minúsculas, números y guiones"),
  description: z.string().trim().max(500, "Máximo 500 caracteres").nullable(),
  is_active: z.boolean(),
  sort_order: z.number().int().min(0, "El orden no puede ser negativo"),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
