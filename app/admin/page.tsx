"use client";

import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { photosOf, supabase, type Saree } from "@/lib/supabase";
import { SITE, formatPrice } from "@/lib/site";

const BUCKET = "sarees";

/** Shrinks a phone photo before upload so the site stays fast. */
async function compressImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.82));
    return blob ?? file;
  } catch {
    return file; // if the browser cannot read the photo, upload it as it is
  }
}

async function uploadPhoto(file: File): Promise<string> {
  const blob = await compressImage(file);
  const isJpeg = blob.type === "image/jpeg";
  const ext = isJpeg ? "jpg" : file.name.split(".").pop() || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase!.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: blob.type || file.type, cacheControl: "31536000" });
  if (error) throw error;
  return supabase!.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

async function removePhotos(urls: string[]) {
  const paths = urls.map((u) => u.split(`/${BUCKET}/`)[1]).filter(Boolean);
  if (paths.length) await supabase!.storage.from(BUCKET).remove(paths);
}

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) return setReady(true);
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-xl px-4 py-8">
      <h1 className="text-center font-serif text-3xl font-semibold">{SITE.name}</h1>
      <p className="mb-8 text-center text-sm text-muted">Manage Sarees</p>

      {!supabase ? (
        <p className="rounded-xl bg-white p-4 text-center text-sm text-plum">
          Supabase is not configured yet. Add the two values from .env.example and restart.
        </p>
      ) : !ready ? (
        <p className="text-center text-muted">Loading…</p>
      ) : session ? (
        <Manager />
      ) : (
        <Login />
      )}
    </main>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    if (error) setError("Wrong email or password. Please try again.");
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="font-serif text-2xl font-semibold">Owner Login</h2>
      <input className="field" type="email" placeholder="Email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="field" type="password" placeholder="Password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="text-sm text-plum">{error}</p>}
      <button className="btn w-full !py-3 !text-base" disabled={busy}>
        {busy ? "Logging in…" : "Log In"}
      </button>
    </form>
  );
}

function Manager() {
  const [sarees, setSarees] = useState<Saree[]>([]);
  const [editing, setEditing] = useState<Saree | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [available, setAvailable] = useState(true);
  const [kept, setKept] = useState<string[]>([]); // photos already saved (when editing)
  const [newPhotos, setNewPhotos] = useState<File[]>([]); // photos chosen now
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const categories = Array.from(
    new Set(sarees.map((s) => s.category?.trim()).filter((c): c is string => !!c))
  ).sort();

  async function load() {
    const { data } = await supabase!.from("sarees").select("*").order("created_at", { ascending: false });
    setSarees(data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setEditing(null);
    setName("");
    setPrice("");
    setCategory("");
    setDescription("");
    setAvailable(true);
    setKept([]);
    setNewPhotos([]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function startEdit(s: Saree) {
    setEditing(s);
    setName(s.name);
    setPrice(String(s.price));
    setCategory(s.category ?? "");
    setDescription(s.description ?? "");
    setAvailable(s.available);
    setKept(photosOf(s));
    setNewPhotos([]);
    if (fileRef.current) fileRef.current.value = "";
    setMessage("");
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function choosePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setNewPhotos((old) => [...old, ...files]);
    e.target.value = ""; // so more photos can be added afterwards
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (kept.length + newPhotos.length === 0) return setMessage("Please add at least one photo.");
    setBusy(true);
    setMessage("");
    try {
      const uploaded: string[] = [];
      for (const file of newPhotos) uploaded.push(await uploadPhoto(file));
      const image_urls = [...kept, ...uploaded];
      const row = {
        name: name.trim(),
        price: Math.round(Number(price)),
        category: category.trim() || null,
        description: description.trim() || null,
        available,
        image_url: image_urls[0],
        image_urls,
      };
      const { error } = editing
        ? await supabase!.from("sarees").update(row).eq("id", editing.id)
        : await supabase!.from("sarees").insert(row);
      if (error) throw error;
      if (editing) await removePhotos(photosOf(editing).filter((u) => !kept.includes(u)));
      setMessage(editing ? "Saree updated ✓" : "Saree added ✓");
      resetForm();
      await load();
    } catch (err) {
      setMessage("Something went wrong: " + (err as Error).message);
    }
    setBusy(false);
  }

  async function toggle(s: Saree) {
    await supabase!.from("sarees").update({ available: !s.available }).eq("id", s.id);
    load();
  }

  async function remove(s: Saree) {
    if (!confirm(`Delete "${s.name}"? This cannot be undone.`)) return;
    const { error } = await supabase!.from("sarees").delete().eq("id", s.id);
    if (error) return setMessage("Could not delete: " + error.message);
    await removePhotos(photosOf(s));
    if (editing?.id === s.id) resetForm();
    load();
  }

  return (
    <div className="space-y-8">
      <form ref={formRef} onSubmit={save} className="scroll-mt-4 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-serif text-2xl font-semibold">{editing ? "Edit Saree" : "Add Saree"}</h2>

        <label className="block text-sm text-muted">
          Saree name
          <input className="field mt-1" required value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label className="block text-sm text-muted">
          Price (₹)
          <input className="field mt-1" type="number" inputMode="numeric" min="0" required value={price} onChange={(e) => setPrice(e.target.value)} />
        </label>

        <div className="text-sm text-muted">
          <label htmlFor="category">Category (for example Silk, Cotton, Bridal)</label>
          <input id="category" className="field mt-1" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Type a category" />
          {categories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    category.trim() === c ? "border-plum bg-plum text-white" : "border-ink/15 text-ink"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <label className="block text-sm text-muted">
          Description (optional)
          <textarea className="field mt-1" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>

        <div className="text-sm text-muted">
          <p>Photos (the first photo is the main one)</p>
          {(kept.length > 0 || newPhotos.length > 0) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {kept.map((url) => (
                <PhotoThumb key={url} src={url} onRemove={() => setKept(kept.filter((u) => u !== url))} />
              ))}
              {newPhotos.map((file, i) => (
                <PhotoThumb
                  key={file.name + i}
                  file={file}
                  onRemove={() => setNewPhotos(newPhotos.filter((_, j) => j !== i))}
                />
              ))}
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={choosePhotos} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()} className="btn-outline mt-2 w-full">
            + Add Photos
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setAvailable(true)} className={available ? "btn" : "btn-outline"}>
            Available
          </button>
          <button type="button" onClick={() => setAvailable(false)} className={!available ? "btn !bg-ink" : "btn-outline"}>
            Sold Out
          </button>
        </div>

        <button className="btn w-full !py-3 !text-base" disabled={busy}>
          {busy ? "Saving…" : editing ? "Save Changes" : "Add Saree"}
        </button>
        {editing && (
          <button type="button" onClick={resetForm} className="btn-outline w-full">
            Cancel
          </button>
        )}
        {message && <p className="text-center text-sm text-plum">{message}</p>}
      </form>

      <section>
        <h2 className="mb-3 font-serif text-2xl font-semibold">Existing Sarees ({sarees.length})</h2>
        {sarees.length === 0 && <p className="text-sm text-muted">No sarees yet. Add your first one above.</p>}
        <ul className="space-y-3">
          {sarees.map((s) => {
            const photos = photosOf(s);
            return (
              <li key={s.id} className="rounded-2xl bg-white p-3 shadow-sm">
                <div className="flex gap-3">
                  <div className="h-24 w-[72px] shrink-0 overflow-hidden rounded-lg bg-sand">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {photos[0] && <img src={photos[0]} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{s.name}</p>
                    <p className="text-sm text-muted">
                      {formatPrice(s.price)}
                      {s.category ? ` · ${s.category}` : ""}
                    </p>
                    <p className="text-xs text-muted">
                      {photos.length} {photos.length === 1 ? "photo" : "photos"}
                    </p>
                    <p className={`mt-1 text-xs font-medium tracking-wide ${s.available ? "text-green-700" : "text-plum"}`}>
                      {s.available ? "AVAILABLE" : "SOLD OUT"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button onClick={() => startEdit(s)} className="btn-outline">Edit</button>
                  <button onClick={() => toggle(s)} className="btn-outline">
                    {s.available ? "Mark Sold Out" : "Mark Available"}
                  </button>
                  <button onClick={() => remove(s)} className="btn-outline !border-red-300 !text-red-700">Delete</button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex justify-between pb-8 text-sm">
        <a href="/" className="text-muted underline underline-offset-4">View website</a>
        <button onClick={() => supabase!.auth.signOut()} className="text-muted underline underline-offset-4">
          Log out
        </button>
      </div>
    </div>
  );
}

function PhotoThumb({ src, file, onRemove }: { src?: string; file?: File; onRemove: () => void }) {
  const [preview, setPreview] = useState(src ?? "");

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="relative h-24 w-[72px] overflow-hidden rounded-lg bg-sand">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {preview && <img src={preview} alt="" className="h-full w-full object-cover" />}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove photo"
        className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-ink/80 text-base leading-none text-white"
      >
        ×
      </button>
    </div>
  );
}
