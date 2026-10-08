import { orderLink } from "@/lib/site";
import type { Saree } from "@/lib/supabase";

export function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.1-5.400A8.500 8.500 0 1 1 21 11.500Z" />
    </svg>
  );
}

export default function BuyButton({
  saree,
  label = "Buy Now",
  className = "",
}: {
  saree: Saree;
  label?: string;
  className?: string;
}) {
  if (!saree.available) {
    return <span className={`btn-disabled ${className}`}>Sold Out</span>;
  }
  return (
    <a
      href={orderLink(saree.name, saree.price)}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn ${className}`}
    >
      <WhatsAppIcon />
      {label}
    </a>
  );
}
