import { z } from "zod";

import { clientInputSchema } from "@/lib/validations/client";

export const quoteStatusSchema = z.enum([
  "draft",
  "sent",
  "viewed",
  "accepted",
  "rejected",
  "expired",
  "cancelled",
  "payment_pending",
  "paid",
]);

export const quoteItemInputSchema = z.object({
  itemType: z.enum(["catalog", "custom"]),
  productId: z.string().uuid().nullable().optional(),
  sku: z.string().trim().max(100).optional().default(""),
  name: z.string().trim().min(1, "Cada partida necesita un nombre.").max(200),
  description: z.string().trim().max(2000).optional().default(""),
  quantity: z.number().positive("La cantidad debe ser mayor que cero.").max(1_000_000),
  unit: z.string().trim().min(1, "Indica la unidad.").max(50),
  unitPrice: z.number().nonnegative("El precio no puede ser negativo.").max(1_000_000_000),
  discountType: z.enum(["none", "fixed", "percentage"]),
  discountValue: z.number().nonnegative().max(1_000_000_000),
  taxRate: z.number().min(0).max(1),
  withholdingRate: z.number().min(0).max(1),
});

export const quoteInputSchema = z
  .object({
    clientId: z.string().uuid().nullable().optional(),
    client: clientInputSchema.omit({ is_active: true }).nullable().optional(),
    requestId: z.string().uuid().nullable().optional(),
    status: quoteStatusSchema.default("draft"),
    currency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
    issueDate: z.string().date(),
    validUntil: z.string().date(),
    shippingTotal: z.number().nonnegative().max(1_000_000_000),
    notes: z.string().trim().max(5000).default(""),
    terms: z.string().trim().max(10000).default(""),
    internalNotes: z.string().trim().max(5000).default(""),
    items: z.array(quoteItemInputSchema).min(1, "Agrega al menos una partida.").max(250),
  })
  .superRefine((value, context) => {
    if (!value.clientId && !value.client) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["clientId"],
        message: "Selecciona o captura un cliente.",
      });
    }

    if (value.validUntil < value.issueDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["validUntil"],
        message: "La vigencia no puede ser anterior a la fecha de emisión.",
      });
    }

    value.items.forEach((item, index) => {
      if (item.discountType === "percentage" && item.discountValue > 100) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", index, "discountValue"],
          message: "El descuento porcentual no puede superar 100%.",
        });
      }
    });
  });

export const quoteStatusUpdateSchema = z.object({
  status: quoteStatusSchema,
  note: z.string().trim().max(2000).optional().default(""),
});

export type QuoteInput = z.infer<typeof quoteInputSchema>;
