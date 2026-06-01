import { siteConfig } from "@/lib/site-config";

type BrandLogoProps = {
  compact?: boolean;
  showTagline?: boolean;
};

export function BrandLogo({ compact = false, showTagline = true }: BrandLogoProps) {
  return (
    <span className="inline-flex items-center gap-3" aria-label={siteConfig.companyName}>
      <span className="relative grid size-11 place-items-center overflow-hidden rounded-xl border border-white/15 bg-slate-950 shadow-glow">
        <svg viewBox="0 0 64 64" className="size-10" aria-hidden="true">
          <path d="M6 8h26l14 24-14 24L6 8Z" fill="#ef1727" />
          <path d="M32 8h26L36 56 24 35l8-15 8 12 7-12H32Z" fill="#0f4f7f" />
          <path d="M13 14h16l12 20-10 17M39 14h12L35 49 26 34l6-10 7 11" fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
          <path d="M24 26h9l3 6h-8l-4-6Z" fill="none" stroke="white" strokeLinejoin="round" strokeWidth="2.2" />
        </svg>
      </span>
      {!compact ? (
        <span className="leading-none">
          <span className="block text-lg font-black tracking-[0.22em] text-white">{siteConfig.shortName}</span>
          {showTagline ? <span className="mt-1 hidden text-[0.58rem] font-black uppercase tracking-[0.34em] text-cyanx sm:block">{siteConfig.tagline}</span> : null}
        </span>
      ) : null}
    </span>
  );
}
