# 🔪 SOC Swiss Knife

> Every analyst utility in one tab — offline, instant, free

Part of the **[SOC Sentinel Hub](https://soc-sentinel.pages.dev)** toolkit for SOC analysts, threat hunters, and blue teamers.

---

## 🛠 Features

| Tab | Operations |
|-----|-----------|
| 🔗 **Defang / Fang** | Auto-detect, defang URLs/IPs/domains, re-fang, bulk paste |
| 🔒 **Encode / Decode** | Base64 (URL-safe), URL, HTML entities, Hex, ROT13, Unicode escape |
| 🔍 **IOC Extractor** | Auto-extract IPv4, IPv6, domains, URLs, hashes (MD5/SHA1/SHA256/SHA512), emails — CSV export |
| 🧬 **String Decoder** | PowerShell -enc, XOR brute force, char codes, hex→ASCII, reverse, multi-layer |
| 🔢 **Hash & IP Tools** | Hash identify/generate, IP↔Hex, CIDR expand, private IP check, IP→binary |

### Killer Feature
Every tab has a **→ Send to IOC Sentinel** button that opens [IOC Sentinel](https://ioc-sentinel.pages.dev) pre-loaded with the output for instant threat intel lookup.

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/YOUR_ORG/soc-sentinel-hub
cd soc-sentinel-hub/swiss-knife

# Install dependencies
npm install

# Start dev server (http://localhost:5173/swiss-knife/)
npm run dev

# Build for production
npm run build
```

---

## 🏗 Tech Stack

- **React 18** + **Vite 5** — fast builds, static output
- **CSS Modules** — scoped styles, zero runtime
- **Zero dependencies** — no lodash, no axios, no UI libraries
- **SubtleCrypto API** — native SHA-1/256/512 hash generation
- **Google Fonts** — Syne + IBM Plex Mono + DM Sans

---

## 📁 Project Structure

```
src/
├── main.jsx              # React entry
├── App.jsx               # Tab router
├── styles/global.css     # Design system tokens
├── components/           # Shared UI components
│   ├── Nav/              # SOC Sentinel Hub nav
│   ├── TabBar/           # Tab switcher
│   ├── IOCButton/        # Send to IOC Sentinel
│   ├── CopyButton/       # Clipboard copy
│   ├── PillSelector/     # Sub-operation pills
│   ├── ActionBar/        # Process/Copy/Clear row
│   └── IOPanel/          # Input/Output panel pair
├── tabs/                 # Tab feature modules
│   ├── DefangFang/       # defang.utils.js + component
│   ├── EncodeDecode/     # encode.utils.js + component
│   ├── IOCExtractor/     # ioc.utils.js + component
│   ├── StringDecoder/    # string.utils.js + component
│   └── HashIP/           # haship.utils.js + component
├── hooks/                # useClipboard, useCtrlEnter, useLocalStorage
└── utils/                # constants.js, ioc-sentinel.js
```

---

## ☁️ Deploy

**Cloudflare Pages** — auto-deploys on push to `main`:

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Output dir | `dist` |
| Root dir | `swiss-knife` |
| Node version | `20` |

Required GitHub Secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

---

## 🎨 Design System

Matches all SOC Sentinel Hub tools:

| Token | Value |
|-------|-------|
| Accent | `#4a90d9` Steel Blue |
| Background | `#06090f` / `#0a0e1a` / `#0d1220` |
| Heading font | Syne 700/800 |
| Code font | IBM Plex Mono |
| Body font | DM Sans |

---

## 🛡 SOC Sentinel Hub

| Tool | URL | Status |
|------|-----|--------|
| IOC Scanner | `/ioc/` | ✅ Live |
| Swiss Knife | `/swiss-knife/` | ✅ Live |
| APT Profiler | `/apt/` | 🔜 Soon |
| Morning Brief | `/brief/` | 🔜 Soon |

---

## 📄 License

MIT — free to use, fork, and build on.
