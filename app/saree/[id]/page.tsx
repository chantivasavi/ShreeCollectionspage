import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BuyButton from "@/components/BuyButton";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import Header from "@/components/Header";
import { SITE, formatPrice } from "@/lib/site";
import { getSaree, photosOf } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const saree = await getSaree(id);
  if (!saree) return { title: SITE.name };
  const cover = photosOf(saree)[0];
  return {
    title: `${saree.name} — ${SITE.name}`,
    description: saree.description ?? `${saree.name} · ${formatPrice(saree.price)}`,
    openGraph: cover ? { images: [cover] } : undefined,
  };
}

export default async function SareePage({ params }: Props) {
  const { id } = await params;
  const saree = await getSaree(id);
  if (!saree) notFound();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-5 sm:py-10">
        <Link href="/#collection" className="text-sm text-muted hover:text-plum">
          ← Back to collection
        </Link>

        <div className="mt-4 grid gap-6 md:grid-cols-2 md:gap-12">
          <Gallery photos={photosOf(saree)} alt={saree.name} soldOut={!saree.available} />

          <div className="md:pt-4">
            {saree.category && (
              <p className="text-xs uppercase tracking-[0.2em] text-gold">{saree.category}</p>
            )}
            <h1 className="mt-1 font-serif text-4xl font-semibold leading-tight">{saree.name}</h1>
            <p className="mt-2 text-2xl text-plum">{formatPrice(saree.price)}</p>
            {saree.description && (
              <p className="mt-5 whitespace-pre-line leading-relaxed text-muted">{saree.description}</p>
            )}
            <BuyButton saree={saree} label="Buy Now on WhatsApp" className="mt-7 w-full !py-3.5 !text-base" />
            <ul className="mt-6 space-y-2 border-t border-ink/10 pt-5 text-sm text-muted">
              <li>✓ {SITE.shipping}</li>
              <li>✓ Availability confirmed on WhatsApp before you pay</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
