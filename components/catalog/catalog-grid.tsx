"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "@/components/catalog/product-card";
import { Search, X } from "lucide-react";
import type { Category, ProductFull } from "@/lib/supabase/types";

interface CatalogGridProps {
  products: ProductFull[];
  categories: Category[];
}

export function CatalogGrid({ products, categories }: CatalogGridProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.sku ?? "").toLowerCase().includes(q) ||
        p.short_description.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      const matchesCategory = !selectedCategory || p.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  function clearFilters() {
    setSearch("");
    setSelectedCategory("");
  }

  const hasFilters = search !== "" || selectedCategory !== "";

  return (
    <div>
      {/* Search and filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, SKU o descripción..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-10 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyanx/50 focus:ring-2 focus:ring-cyanx/20"
            aria-label="Buscar productos"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-white"
              aria-label="Limpiar búsqueda"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Category filter chips */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
            <button
              onClick={() => setSelectedCategory("")}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                !selectedCategory
                  ? "border-cyanx/40 bg-cyanx/15 text-cyanx"
                  : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white"
              }`}
              aria-pressed={!selectedCategory}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? "" : cat.id)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  selectedCategory === cat.id
                    ? "border-cyanx/40 bg-cyanx/15 text-cyanx"
                    : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                }`}
                aria-pressed={selectedCategory === cat.id}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results count */}
      {hasFilters && (
        <div className="mb-5 flex items-center gap-3">
          <p className="text-sm text-slate-400">
            {filtered.length === 0
              ? "Sin resultados"
              : `${filtered.length} producto${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`}
          </p>
          <button
            onClick={clearFilters}
            className="text-xs text-cyanx underline hover:no-underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] py-20 text-center">
          <div className="mb-4 text-5xl" aria-hidden="true">🔍</div>
          <h3 className="text-lg font-semibold text-white">Sin resultados</h3>
          <p className="mt-2 text-sm text-slate-400">
            No encontramos productos que coincidan con tu búsqueda.
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-5 rounded-full border border-cyanx/30 bg-cyanx/10 px-5 py-2 text-sm font-medium text-cyanx transition hover:bg-cyanx/20"
            >
              Ver todos los productos
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
