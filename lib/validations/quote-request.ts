import { z } from "zod";

export const quoteRequestStatusSchema = z.enum([
  "new",
  "reviewing",
  "converted",
  "closed",
]);

const nullableText = (max: number) =>
  z.string().trim().max(max).nullable().optional();

export const quoteRequestCartItemSchema = z.object({
  product_id: z.string().max(100).optional(),
  name: z.string().trim().min(1, "Nombre de producto requerido").max(200),
  sku: nullableText(50),
  quantity: z.number().int().min(1).max(9999),
  url: nullableText(500),
  observations: nullableText(500),
  unit_price: z.number().finite().min(0).nullable().optional(),
  image_url: nullableText(500),
});

export const quoteRequestSchema = z.object({
  customer_name: z.string().trim().min(1, "Nombre requerido").max(200),
  company: nullableText(200),
  email: z.string().trim().email("Correo inválido").max(200),
  phone: z.string().trim().min(7, "Teléfono inválido").max(20),
  rfc: nullableText(13),
  general_notes: nullableText(2000),
  cart_snapshot: z
    .array(quoteRequestCartItemSchema)
    .min(1, "Al menos un producto requerido")
    .max(50),
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;
