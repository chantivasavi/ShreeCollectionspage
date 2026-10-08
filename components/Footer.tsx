import { SITE, contactLink } from "@/lib/site";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 px-4 py-10 text-center text-sm text-muted">
      <Logo className="mx-auto h-24" />
      <p className="mt-2 font-serif text-xl font-semibold text-ink">{SITE.name}</p>
      <p className="mt-2">{SITE.area}</p>
      <p>One-Day Shipping Available</p>
      <p className="mt-1">
        WhatsApp:{" "}
        <a href={contactLink} target="_blank" rel="noopener noreferrer" className="text-plum underline-offset-4 hover:underline">
          {SITE.whatsappDisplay}
        </a>
      </p>
    </footer>
  );
}
