import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null);

export const companySettingsSchema = z.object({
  legal_name: z.string().trim().min(2, "Escribe la razón social.").max(200),
  trade_name: z.string().trim().min(2, "Escribe el nombre comercial.").max(200),
  rfc: optionalText(13).transform((value) => value?.toUpperCase() ?? null),
  phone: z.string().trim().max(30),
  email: z.string().trim().email("El correo no es válido.").max(254),
  website: z.union([z.string().trim().url("El sitio web no es válido."), z.literal("")]),
  whatsapp: optionalText(30),
  responsible_name: optionalText(160),
  currency: z.enum(["MXN", "USD"]),
  default_validity_days: z.number().int().min(1).max(365),
  default_terms: optionalText(10_000),
  default_tax_rate: z.number().min(0).max(1),
  default_withholding_rate: z.number().min(0).max(1),
  tax_enabled: z.boolean(),
  withholding_enabled: z.boolean(),
  quote_prefix: z
    .string()
    .trim()
    .min(1)
    .max(10)
    .regex(/^[A-Za-z0-9-]+$/, "Usa solo letras, números y guiones.")
    .transform((value) => value.toUpperCase()),
  pdf_footer: optionalText(1000),
  address: z.object({
    street: z.string().trim().max(160),
    exterior_number: z.string().trim().max(20),
    interior_number: z.string().trim().max(20).optional(),
    neighborhood: z.string().trim().max(120),
    city: z.string().trim().max(120),
    state: z.string().trim().max(120),
    zip_code: z.string().trim().max(12),
    country: z.string().trim().max(120),
  }),
});

export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;
