import type { Address } from "@/lib/types/database";

export function formatAddress(address?: Address | null) {
  if (!address) return undefined;
  const streetLine = [
    address.street,
    address.exterior_number,
    address.interior_number ? `Int. ${address.interior_number}` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const cityLine = [
    address.neighborhood,
    address.city,
    address.state,
    address.zip_code,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
  return [streetLine, cityLine].filter(Boolean).join("\n") || undefined;
}
