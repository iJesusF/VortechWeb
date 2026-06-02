import Image from "next/image";
import { siteConfig } from "@/lib/site-config";

type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  const width = compact ? 116 : 148;
  const height = compact ? 28 : 36;

  return (
    <span className="inline-flex items-center" aria-label={siteConfig.companyName}>
      <span className="inline-flex rounded-md bg-white px-2.5 py-1 shadow-[0_0_26px_rgba(255,255,255,0.12)] ring-1 ring-white/20 transition duration-300 group-hover:shadow-[0_0_34px_rgba(19,216,255,0.22)]">
        <Image
          src="/vortech-logo-text.svg"
          alt={siteConfig.companyName}
          width={width}
          height={height}
          priority={!compact}
          className={compact ? "h-auto w-[116px]" : "h-auto w-[116px] sm:w-[148px]"}
        />
      </span>
    </span>
  );
}
