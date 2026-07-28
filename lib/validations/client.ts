import { z } from "zod";

const optionalTrimmedString = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(max).optional()
  );

export const clientInputSchema = z.object({
  client_type: z.enum(["individual", "company"]).default("company"),
  business_name: z.string().trim().min(2, "Escribe el nombre o razón social.").max(160),
  contact_name: z.string().trim().min(2, "Escribe el nombre del contacto.").max(160),
  email: z.string().trim().toLowerCase().email("El correo no es válido.").max(254),
  phone: z.string().trim().min(7, "El teléfono no es válido.").max(30),
  rfc: optionalTrimmedString(13).transform((value) => value?.toUpperCase()),
  tax_regime: optionalTrimmedString(120),
  cfdi_use: optionalTrimmedString(20),
  fiscal_zip_code: optionalTrimmedString(10),
  notes: optionalTrimmedString(2000),
  is_active: z.boolean().default(true),
});

export const clientUpdateSchema = clientInputSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "No hay cambios para guardar."
);

export type ClientInput = z.infer<typeof clientInputSchema>;
