"use client";

import { useState, useMemo } from "react";
import { Search, Filter, Package } from "lucide-react";
import type { Category, ProductWithCategory } from "@/lib/types/database";
import { ProductCard } from "./product-card";

interface CatalogClientProps {
  products: ProductWithCategory[];
  categories: Category[];
  coverImages: Record<string, string>;
}

export function CatalogClient({
  products,
  categories,
  coverImages,
}: CatalogClientProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.short_description.toLowerCase().includes(query) ||
          (p.sku && p.sku.toLowerCase().includes(query))
      );
    }

    if (selectedCategory) {
      result = result.filter((p) => p.category_id === selectedCategory);
    }

    return result;
  }, [products, search, selectedCategory]);

  return (
    <div>
      {/* Search and Filter Bar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-3 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyanx focus:ring-2 focus:ring-cyanx/20"
            aria-label="Buscar productos"
          />
        </div>
      </div>

      {/* Category Filters */}
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por categoría">
          <Filter className="size-4 text-slate-400" aria-hidden="true" />
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              selectedCategory === null
                ? "border border-cyanx/40 bg-cyanx/15 text-cyanx"
                : "border border-white/10 bg-white/5 text-slate-300 hover:border-cyanx/30 hover:text-cyanx"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedCategory === cat.id
                  ? "border border-cyanx/40 bg-cyanx/15 text-cyanx"
                  : "border border-white/10 bg-white/5 text-slate-300 hover:border-cyanx/30 hover:text-cyanx"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              coverImage={coverImages[product.id]}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.03] py-20 text-center">
          <Package className="mb-4 size-12 text-slate-500" />
          <h3 className="text-lg font-semibold text-white">
            No se encontraron productos
          </h3>
          <p className="mt-2 max-w-md text-sm text-slate-400">
            {search || selectedCategory
              ? "Intenta ajustar los filtros o el término de búsqueda."
              : "Aún no hay productos publicados en el catálogo."}
          </p>
          {(search || selectedCategory) && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory(null);
              }}
              className="mt-4 rounded-full border border-cyanx/30 bg-cyanx/10 px-4 py-2 text-sm font-medium text-cyanx transition hover:bg-cyanx/20"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
