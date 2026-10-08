"use client";

import { useRef, useState } from "react";

/** Swipeable photo gallery with thumbnails. */
export default function Gallery({ photos, alt, soldOut }: { photos: string[]; alt: string; soldOut: boolean }) {
  const strip = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function goTo(i: number) {
    const el = strip.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl bg-sand">
        <div
          ref={strip}
          onScroll={(e) => {
            const el = e.currentTarget;
            setIndex(Math.round(el.scrollLeft / el.clientWidth));
          }}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        >
          {photos.length === 0 && <div className="aspect-[3/4] w-full" />}
          {photos.map((src, i) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={src}
              src={src}
              alt={i === 0 ? alt : `${alt} – photo ${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
              className="aspect-[3/4] w-full shrink-0 snap-center object-cover"
            />
          ))}
        </div>
        {soldOut && (
          <span className="absolute left-3 top-3 rounded-full bg-ink px-4 py-1.5 text-xs font-medium tracking-[0.15em] text-white">
            SOLD OUT
          </span>
        )}
        {photos.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-3 py-1 text-xs text-white">
            {index + 1} / {photos.length}
          </span>
        )}
      </div>

      {photos.length > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {photos.map((src, i) => (
            <button
              key={src}
              onClick={() => goTo(i)}
              aria-label={`Photo ${i + 1}`}
              className={`h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                i === index ? "border-plum" : "border-transparent opacity-70"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
