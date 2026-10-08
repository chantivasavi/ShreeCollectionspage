import { SITE, contactLink } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-sand/60 px-4 py-10 text-center text-sm text-muted">
      <p className="font-serif text-2xl font-semibold text-ink">{SITE.name}</p>
      <p className="mt-3">{SITE.area}</p>
      <p>One-Day Shipping Available</p>
      <p className="mt-1">
        WhatsApp:{" "}
        <a href={contactLink} target="_blank" rel="noopener noreferrer" className="text-maroon underline-offset-4 hover:underline">
          {SITE.whatsappDisplay}
        </a>
      </p>
    </footer>
  );
}
