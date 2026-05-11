<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Regrade (web app)

Run Regrade locally (Vite + Firebase). AI features are served via the optional `server/` API.

## Run Locally

**Prerequisites:** Node.js


1. Install dependencies:
   `npm install`
2. Copy **`.env.example`** to **`.env`** and set **`VITE_FIREBASE_*`** (see `FIREBASE_SETUP.md`).
3. (Optional) Enable AI features:
   - Create `server/.env` with `GEMINI_API_KEY` (server only; **never** in Vite / the browser).
   - Start the API: `npm --prefix server install && npm --prefix server run dev`
4. Run the app:
   `npm run dev`
