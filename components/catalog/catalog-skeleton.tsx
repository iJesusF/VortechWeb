export function CatalogSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Cargando catálogo">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass-panel animate-pulse overflow-hidden rounded-2xl">
          <div className="aspect-video bg-white/[0.06]" />
          <div className="p-5 space-y-3">
            <div className="h-4 w-3/4 rounded bg-white/[0.06]" />
            <div className="h-3 w-1/3 rounded bg-white/[0.04]" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-white/[0.04]" />
              <div className="h-3 w-5/6 rounded bg-white/[0.04]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
