# Shree Collections 999

A simple saree catalogue website. Customers browse sarees and tap **Buy Now** to order on WhatsApp.
No cart, no checkout, no payments.

Built with Next.js, TypeScript, Tailwind CSS and Supabase. Hosted on Vercel.

## 1. Install

You need [Node.js](https://nodejs.org) 18.18 or newer.

```bash
npm install
```

## 2. Configure Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste everything from `supabase/schema.sql`, and press **Run**.
   This creates the `sarees` table and the `sarees` photo bucket.
3. Open **Project Settings → API** and copy the **Project URL** and the **anon public** key.
4. Copy `.env.example` to `.env.local` and paste the two values in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

## 3. Run locally

```bash
npm run dev
```

Open http://localhost:3000 for the website and http://localhost:3000/admin for the owner page.

## 4. Create the admin login

1. In Supabase open **Authentication → Users → Add user → Create new user**.
2. Enter the owner's email and a strong password, and tick **Auto Confirm User**.
3. **Important:** open **Authentication → Sign In / Providers** and turn **off**
   "Allow new users to sign up". Any logged-in user can edit the catalogue, so only
   the owner account you created should exist.

The owner logs in at `/admin` with that email and password. To change the password later,
edit the user in Supabase.

## 5. Deploy to Vercel

1. Push this folder to a GitHub repository.
2. At [vercel.com](https://vercel.com) choose **Add New → Project** and import the repository.
3. Under **Environment Variables** add `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same values as `.env.local`).
4. Press **Deploy**. Put the Vercel link in the Instagram bio.

## 6. How the owner adds and deletes sarees

1. On her phone, open `your-site.vercel.app/admin` and log in (she stays logged in).
2. **Add a saree:** fill in the name and price, pick or type a category, tap
   **+ Add Photos** to choose one or more pictures (the first is the main photo),
   then tap **Add Saree**. It appears on the website straight away.
3. **Sold out:** tap **Mark Sold Out** on the saree. It shows a SOLD OUT label and the
   Buy Now button is disabled. Tap **Mark Available** to bring it back.
4. **Edit:** tap **Edit**, change anything, tap **Save Changes**.
5. **Delete:** tap **Delete** and confirm. The saree and its photo are removed.

Tip: on the phone, use "Add to Home Screen" for the `/admin` page so it opens like an app.

## Changing the phone number or text

The business name, WhatsApp number, shipping line and WhatsApp message are all in `lib/site.ts`.

## Project structure

```
app/page.tsx              Home page (hero, collection, contact)
app/saree/[id]/page.tsx   Saree detail page
app/admin/page.tsx        Owner login + manage sarees
components/               Header, footer, logo, saree grid, photo gallery, Buy Now button
public/logo.png           The logo (replace this file to change it)
lib/site.ts               Business details and WhatsApp links
lib/supabase.ts           Supabase client and catalogue queries
supabase/schema.sql       Database + storage setup
```
