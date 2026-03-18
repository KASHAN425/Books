# SHAH-WRITES eBook Store

A light-themed animated eBook storefront built with HTML, CSS, JavaScript, jQuery, and Bootstrap.

## Pages
- `index.html` — user storefront.
- `admin.html` — separate admin dashboard to add/edit/remove/hide books.

## Data & PDFs
- Book metadata is now stored in Vercel Blob at `data/books.json` through the `/api/books` serverless endpoint.
- PDF links can point to Vercel Blob file URLs or local demo files under `pdf/books/`.
- If Blob is not configured yet, the UI falls back to built-in demo data.

## Vercel Blob setup
1. Create/connect a Vercel Blob store to the project.
2. Use the default prefix `BLOB` so Vercel creates `BLOB_READ_WRITE_TOKEN`.
3. Deploy to Vercel.
4. Open the admin dashboard and add/edit books. Changes will be written to Blob.

## Local / build notes
- This project uses Vercel serverless functions in `api/`.
- For local Vercel development, pull environment variables with `vercel env pull`.
- If `BLOB_READ_WRITE_TOKEN` is missing, the UI shows fallback demo books.

## Admin access
- Admin name: `kashanabbasi`
- Password: `kashanabbabb`

## Optional PHP + MySQL starter
A sample PHP/MySQL folder remains in `backend-php/`, but Vercel Blob is now the active data layer for this frontend deployment.
