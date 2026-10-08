import Link from "next/link";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-ink/10 bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5">
        <Link href="/" aria-label="Home">
          <Logo className="h-14 sm:h-16" />
        </Link>
        <nav className="flex gap-4 text-[11px] uppercase tracking-[0.16em] text-muted sm:gap-7 sm:text-xs">
          <Link href="/" className="py-2 hover:text-plum">Home</Link>
          <Link href="/#collection" className="py-2 hover:text-plum">Collections</Link>
          <Link href="/#contact" className="py-2 hover:text-plum">Contact</Link>
        </nav>
      </div>
    </header>
  );
}
