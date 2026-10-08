import Link from "next/link";
import { SITE } from "@/lib/site";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-ink/10 bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 px-4 py-3 sm:flex-row sm:justify-between">
        <Link href="/" className="font-serif text-2xl font-semibold tracking-wide">
          {SITE.name}
        </Link>
        <nav className="flex gap-6 text-xs uppercase tracking-[0.18em] text-muted">
          <Link href="/" className="py-1 hover:text-maroon">Home</Link>
          <Link href="/#collection" className="py-1 hover:text-maroon">Collections</Link>
          <Link href="/#contact" className="py-1 hover:text-maroon">Contact</Link>
        </nav>
      </div>
    </header>
  );
}
