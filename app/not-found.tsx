import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="font-serif text-4xl font-semibold">Saree not found</h1>
      <p className="mt-2 text-muted">It may have been removed from the collection.</p>
      <Link href="/" className="btn mt-6">View Collection</Link>
    </main>
  );
}
