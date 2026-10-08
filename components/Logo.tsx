import { SITE } from "@/lib/site";

/** The official logo, shown exactly as supplied (only the empty margin is trimmed). */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src="/logo.png"
      alt={SITE.name}
      width={705}
      height={677}
      className={`w-auto mix-blend-multiply ${className}`}
    />
  );
}
