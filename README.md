# Monica — Rehab Online Chatbot

Monica is the AI-powered chat assistant on [rehab-online.org.uk](https://rehab-online.org.uk). She helps people find the right UK residential treatment centre for addiction and mental health.

Built on Cloudflare Workers + KV. No server, no database subscription.

---

## How it works

- **Worker** (`src/worker.js`) handles all chat requests, admin, and analytics
- **CLINICS KV** stores the directory of 65+ treatment centres
- **ANALYTICS KV** stores conversation counters and recent query log
- **Anthropic API** (Claude Haiku) powers the chat responses

The admin panel at `/admin` lets the team edit clinic data without touching code.

---

## Setup (new deployment)

### 1. Prerequisites

- [Cloudflare account](https://dash.cloudflare.com/sign-up) (free)
- [Node.js](https://nodejs.org) 18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/): `npm install -g wrangler`
- [Anthropic API key](https://console.anthropic.com)

### 2. Create KV namespaces

In your Cloudflare dashboard, go to Workers > KV and create two namespaces:
- `MONICA_CLINICS`
- `MONICA_ANALYTICS`

Note down both namespace IDs.

### 3. Update wrangler.toml

Replace the values in `wrangler.toml`:

```toml
account_id = "YOUR_CLOUDFLARE_ACCOUNT_ID"

[[kv_namespaces]]
binding = "ANALYTICS"
id = "YOUR_ANALYTICS_KV_ID"

[[kv_namespaces]]
binding = "CLINICS"
id = "YOUR_CLINICS_KV_ID"
```

### 4. Set the API key secret

```bash
wrangler secret put ANTHROPIC_API_KEY
```

Paste your Anthropic API key when prompted.

### 5. Upload clinic data

```bash
python3 upload_clinics_to_kv.py
```

This populates the CLINICS KV with the full directory.

### 6. Deploy

```bash
wrangler deploy
```

---

## Admin panel

Visit `/admin` on your worker URL. The default password is in `src/worker.js` — change `ADMIN_PASSWORD` before going live.

---

## Custom domain

Add a custom domain (e.g. `chat.rehab-online.org.uk`) via the Cloudflare Workers dashboard under your worker > Triggers > Custom Domains.

---

## Running costs

| Service | Cost |
|---|---|
| Cloudflare Workers | Free (100k requests/day) |
| Cloudflare KV | Free at this scale |
| Anthropic (Claude Haiku) | ~£0.05–0.20 per 1,000 conversations |

---

## Making changes

Monica's behaviour is controlled by the system prompt in `src/worker.js` (`buildSystemPrompt`). Clinic data is managed via the admin panel — no code changes needed for day-to-day directory updates.
