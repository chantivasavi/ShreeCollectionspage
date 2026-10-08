import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SareeGrid from "@/components/SareeGrid";
import { WhatsAppIcon } from "@/components/BuyButton";
import { SITE, contactLink } from "@/lib/site";
import { getSarees } from "@/lib/supabase";

// Always show the latest catalogue, so new sarees appear immediately.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const sarees = await getSarees();

  return (
    <>
      <Header />
      <main>
        <section className="px-4 py-14 text-center sm:py-20">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Beautiful Sarees for Every Occasion</p>
          <h1 className="mt-4 font-serif text-5xl font-semibold leading-tight sm:text-6xl">{SITE.name}</h1>
          <p className="mt-3 font-serif text-2xl text-muted">{SITE.tagline}</p>
          <p className="mx-auto mt-6 inline-block rounded-full border border-gold/50 px-4 py-2 text-xs tracking-wide text-ink sm:text-sm">
            {SITE.shipping}
          </p>
          <div className="mt-8">
            <a href="#collection" className="btn px-8">View Collection</a>
          </div>
        </section>

        <section id="collection" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-16">
          <h2 className="mb-6 text-center font-serif text-3xl font-semibold">The Collection</h2>
          <SareeGrid sarees={sarees} />
        </section>

        <section id="contact" className="scroll-mt-24 bg-white px-4 py-14 text-center">
          <h2 className="font-serif text-3xl font-semibold">Want to order a saree?</h2>
          <p className="mt-2 text-muted">Chat with us on WhatsApp</p>
          <a href={contactLink} target="_blank" rel="noopener noreferrer" className="btn mt-6 px-8">
            <WhatsAppIcon />
            {SITE.whatsappDisplay}
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}
