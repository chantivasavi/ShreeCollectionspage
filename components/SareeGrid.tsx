"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/site";
import type { Saree } from "@/lib/supabase";
import BuyButton from "./BuyButton";

export default function SareeGrid({ sarees }: { sarees: Saree[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = q ? sarees.filter((s) => s.name.toLowerCase().includes(q)) : sarees;

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
        className="field mx-auto mb-8 block max-w-md rounded-full text-center"
      />

      {shown.length === 0 && (
        <p className="py-10 text-center text-muted">No sarees match “{query}”.</p>
      )}

      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
        {shown.map((s) => (
          <article key={s.id} className="flex flex-col">
            <Link href={`/saree/${s.id}`} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-sand">
                {s.image_url && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={s.image_url}
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
              </div>
              <h3 className="mt-3 font-serif text-lg font-semibold leading-snug sm:text-xl">{s.name}</h3>
              <p className="mt-0.5 text-sm text-muted">{formatPrice(s.price)}</p>
            </Link>
            <BuyButton saree={s} className="mt-3 w-full" />
          </article>
        ))}
      </div>
    </>
  );
}
