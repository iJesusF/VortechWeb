"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { useQuoteCart } from "./cart-provider";
import type { DemoProduct } from "@/lib/data/catalog-demo";

interface AddToQuoteButtonProps {
  product: DemoProduct;
  variant?: "small" | "large";
}

export function AddToQuoteButton({ product, variant = "small" }: AddToQuoteButtonProps) {
  const { addItem } = useQuoteCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      productId: product.id,
      name: product.name,
      sku: product.sku || undefined,
      unitPrice: product.unit_price || undefined,
      imageUrl: product.image_url || undefined,
      url: `/catalogo/${product.slug}`,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (variant === "large") {
    return (
      <button
        type="button"
        onClick={handleAdd}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition duration-300 ${
          added
            ? "border border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
            : "bg-cyanx text-slate-950 shadow-glow hover:-translate-y-0.5 hover:bg-white"
        }`}
      >
        {added ? (
          <>
            <Check className="size-4" />
            Agregado a cotización
          </>
        ) : (
          <>
            <Plus className="size-4" />
            Agregar a cotización
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={`mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition duration-300 ${
        added
          ? "border border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
          : "border border-cyanx/30 bg-cyanx/10 text-cyanx hover:bg-cyanx/20"
      }`}
    >
      {added ? (
        <>
          <Check className="size-3.5" />
          Agregado
        </>
      ) : (
        <>
          <Plus className="size-3.5" />
          Agregar a cotización
        </>
      )}
    </button>
  );
}
