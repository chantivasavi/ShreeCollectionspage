import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BuyButton from "@/components/BuyButton";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { SITE, formatPrice } from "@/lib/site";
import { getSaree } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const saree = await getSaree(id);
  if (!saree) return { title: SITE.name };
  return {
    title: `${saree.name} — ${SITE.name}`,
    description: saree.description ?? `${saree.name} · ${formatPrice(saree.price)}`,
    openGraph: saree.image_url ? { images: [saree.image_url] } : undefined,
  };
}

export default async function SareePage({ params }: Props) {
  const { id } = await params;
  const saree = await getSaree(id);
  if (!saree) notFound();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
        <Link href="/#collection" className="text-sm text-muted hover:text-maroon">
          ← Back to collection
        </Link>

        <div className="mt-4 grid gap-6 md:grid-cols-2 md:gap-10">
          <div className="relative overflow-hidden rounded-lg bg-sand">
            {saree.image_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={saree.image_url} alt={saree.name} className="w-full object-cover" />
            ) : (
              <div className="aspect-[3/4]" />
            )}
            {!saree.available && (
              <span className="absolute left-3 top-3 rounded-full bg-ink px-4 py-1.5 text-xs font-medium tracking-[0.15em] text-white">
                SOLD OUT
              </span>
            )}
          </div>

          <div className="md:pt-6">
            <h1 className="font-serif text-4xl font-semibold leading-tight">{saree.name}</h1>
            <p className="mt-2 text-2xl text-maroon">{formatPrice(saree.price)}</p>
            {saree.description && (
              <p className="mt-5 whitespace-pre-line leading-relaxed text-muted">{saree.description}</p>
            )}
            <BuyButton saree={saree} label="Buy Now on WhatsApp" className="mt-7 w-full !py-3.5 !text-base" />
            <p className="mt-4 text-center text-xs tracking-wide text-muted">{SITE.shipping}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
