import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Logo from "@/components/Logo";
import SareeGrid from "@/components/SareeGrid";
import { WhatsAppIcon } from "@/components/BuyButton";
import { SITE, contactLink } from "@/lib/site";
import { getSarees } from "@/lib/supabase";

// Always show the latest catalogue, so new sarees appear immediately.
export const dynamic = "force-dynamic";

function Divider() {
  return (
    <div className="mx-auto mt-3 flex items-center justify-center gap-3" aria-hidden="true">
      <span className="h-px w-12 bg-gold/60" />
      <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
      <span className="h-px w-12 bg-gold/60" />
    </div>
  );
}

const PROMISES = [
  ["One-Day Shipping", SITE.area],
  ["Order on WhatsApp", "Quick and personal"],
  ["Handpicked Sarees", "For every occasion"],
];

export default async function HomePage() {
  const sarees = await getSarees();

  return (
    <>
      <Header />
      <main>
        <section className="px-4 pb-12 pt-8 text-center sm:pb-16 sm:pt-12">
          <Logo className="mx-auto h-52 sm:h-64" />
          <h1 className="sr-only">{SITE.name}</h1>
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-gold">Beautiful Sarees for Every Occasion</p>
          <p className="mt-3 font-serif text-3xl font-medium leading-tight sm:text-4xl">{SITE.tagline}</p>
          <p className="mx-auto mt-5 max-w-xs text-sm text-muted sm:max-w-none">{SITE.shipping}</p>
          <div className="mt-7">
            <a href="#collection" className="btn px-9 !py-3">View Collection</a>
          </div>
        </section>

        <section className="border-y border-ink/10 bg-white">
          <div className="mx-auto grid max-w-4xl grid-cols-3 divide-x divide-ink/10 px-2 py-5 text-center">
            {PROMISES.map(([title, sub]) => (
              <div key={title} className="px-2">
                <p className="font-serif text-base font-semibold leading-tight sm:text-xl">{title}</p>
                <p className="mt-1 text-[11px] leading-snug text-muted sm:text-sm">{sub}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="collection" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:py-16">
          <div className="mb-8 text-center">
            <h2 className="font-serif text-4xl font-semibold">The Collection</h2>
            <Divider />
          </div>
          <SareeGrid sarees={sarees} />
        </section>

        <section id="contact" className="scroll-mt-24 bg-plum px-4 py-14 text-center text-white">
          <h2 className="font-serif text-4xl font-semibold">Want to order a saree?</h2>
          <p className="mt-2 text-white/80">Chat with us on WhatsApp</p>
          <a
            href={contactLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn mt-6 !bg-white px-8 !py-3 !text-base !text-plum hover:!bg-sand"
          >
            <WhatsAppIcon />
            {SITE.whatsappDisplay}
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}
