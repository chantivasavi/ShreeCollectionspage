"use client";

import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, type Saree } from "@/lib/supabase";
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

async function removePhoto(url: string | null) {
  const path = url?.split(`/${BUCKET}/`)[1];
  if (path) await supabase!.storage.from(BUCKET).remove([path]);
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
        <p className="rounded-xl bg-white p-4 text-center text-sm text-maroon">
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
      {error && <p className="text-sm text-maroon">{error}</p>}
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
  const [description, setDescription] = useState("");
  const [available, setAvailable] = useState(true);
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
    setDescription("");
    setAvailable(true);
    setPhoto(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function startEdit(s: Saree) {
    setEditing(s);
    setName(s.name);
    setPrice(String(s.price));
    setDescription(s.description ?? "");
    setAvailable(s.available);
    setPhoto(null);
    if (fileRef.current) fileRef.current.value = "";
    setMessage("");
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing && !photo) return setMessage("Please choose a photo.");
    setBusy(true);
    setMessage("");
    try {
      const image_url = photo ? await uploadPhoto(photo) : editing!.image_url;
      const row = {
        name: name.trim(),
        price: Math.round(Number(price)),
        description: description.trim() || null,
        available,
        image_url,
      };
      const { error } = editing
        ? await supabase!.from("sarees").update(row).eq("id", editing.id)
        : await supabase!.from("sarees").insert(row);
      if (error) throw error;
      if (editing && photo) await removePhoto(editing.image_url);
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
    await removePhoto(s.image_url);
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

        <label className="block text-sm text-muted">
          Description (optional)
          <textarea className="field mt-1" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>

        <label className="block text-sm text-muted">
          Photo {editing && "(leave empty to keep the current photo)"}
          <input
            ref={fileRef}
            className="mt-1 block w-full text-sm text-ink file:mr-3 file:rounded-full file:border-0 file:bg-sand file:px-4 file:py-2.5 file:text-sm file:font-medium"
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          />
        </label>

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
        {message && <p className="text-center text-sm text-maroon">{message}</p>}
      </form>

      <section>
        <h2 className="mb-3 font-serif text-2xl font-semibold">Existing Sarees ({sarees.length})</h2>
        {sarees.length === 0 && <p className="text-sm text-muted">No sarees yet. Add your first one above.</p>}
        <ul className="space-y-3">
          {sarees.map((s) => (
            <li key={s.id} className="rounded-2xl bg-white p-3 shadow-sm">
              <div className="flex gap-3">
                <div className="h-24 w-[72px] shrink-0 overflow-hidden rounded-lg bg-sand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {s.image_url && <img src={s.image_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{s.name}</p>
                  <p className="text-sm text-muted">{formatPrice(s.price)}</p>
                  <p className={`mt-1 text-xs font-medium tracking-wide ${s.available ? "text-green-700" : "text-maroon"}`}>
                    {s.available ? "AVAILABLE" : "SOLD OUT"}
                  </p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button onClick={() => startEdit(s)} className="btn-outline">Edit</button>
                <button onClick={() => toggle(s)} className="btn-outline">
                  {s.available ? "Mark Sold Out" : "Mark Available"}
                </button>
                <button onClick={() => remove(s)} className="btn-outline !border-maroon/40 !text-maroon">Delete</button>
              </div>
            </li>
          ))}
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
