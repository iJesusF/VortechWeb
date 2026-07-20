import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100, "Máximo 100 caracteres"),
  slug: z
    .string()
    .min(1, "El slug es requerido")
    .max(120, "Máximo 120 caracteres")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Solo letras minúsculas, números y guiones"),
  description: z.string().max(500, "Máximo 500 caracteres").nullable().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
