"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/site";
import { photosOf, type Saree } from "@/lib/supabase";
import BuyButton from "./BuyButton";

export default function SareeGrid({ sarees }: { sarees: Saree[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const categories = Array.from(
    new Set(sarees.map((s) => s.category?.trim()).filter((c): c is string => !!c))
  ).sort();

  const q = query.trim().toLowerCase();
  const shown = sarees.filter(
    (s) =>
      (category === "All" || s.category?.trim() === category) &&
      (!q || s.name.toLowerCase().includes(q))
  );

  if (sarees.length === 0) {
    return <p className="py-16 text-center text-muted">New sarees are coming soon.</p>;
  }

  return (
    <>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search sarees…"
        aria-label="Search sarees"
        className="field mx-auto mb-5 block max-w-md rounded-full text-center"
      />

      {categories.length > 0 && (
        <div className="no-scrollbar -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 sm:flex-wrap sm:justify-center">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`min-h-[40px] shrink-0 rounded-full border px-5 text-sm transition ${
                category === c
                  ? "border-plum bg-plum text-white"
                  : "border-ink/15 bg-white text-ink hover:border-plum"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 && <p className="py-10 text-center text-muted">No sarees found.</p>}

      <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
        {shown.map((s) => {
          const photos = photosOf(s);
          return (
            <article key={s.id} className="flex flex-col">
              <Link href={`/saree/${s.id}`} className="group flex flex-1 flex-col">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-sand">
                  {photos[0] && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={photos[0]}
                      alt={s.name}
                      loading="lazy"
                      className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
                        s.available ? "" : "opacity-60"
                      }`}
                    />
                  )}
                  {!s.available && (
                    <span className="absolute left-2 top-2 rounded-full bg-ink px-3 py-1 text-[11px] font-medium tracking-[0.15em] text-white">
                      SOLD OUT
                    </span>
                  )}
                  {photos.length > 1 && (
                    <span className="absolute bottom-2 right-2 rounded-full bg-ink/70 px-2.5 py-0.5 text-[11px] text-white">
                      {photos.length} photos
                    </span>
                  )}
                </div>
                {s.category && (
                  <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-gold">{s.category}</p>
                )}
                <h3 className={`font-serif text-lg font-semibold leading-snug sm:text-xl ${s.category ? "mt-0.5" : "mt-3"}`}>
                  {s.name}
                </h3>
                <p className="mt-0.5 text-[15px] text-ink">{formatPrice(s.price)}</p>
              </Link>
              <BuyButton saree={s} className="mt-3 w-full" />
            </article>
          );
        })}
      </div>
    </>
  );
}
