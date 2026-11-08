# Contact Enrichment UI

A minimal, modern, and reactive web application for **Contact Enrichment** that connects to the streaming backend API (`/api/scan`).

## Features
- **Multi-Chip Domain Input**: Type domains (`Enter`, `Comma`, `Space`) or paste comma/newline-separated lists.
- **Enrichment Controls**:
  - Email Verification radio (`isVerify: true/false`)
  - LinkedIn Discovery radio (`isLinkedin: true/false`)
  - Scan CTA with loading state and immediate stop/abort capability
- **Live Backend Stream**: Terminal feed with auto-scroll and status indicators (`[+]`, `[!]`, `[-]`, `[i]`, `[*]`).
- **Interactive Contacts Grid**:
  - Live table populated as soon as `result` events arrive
  - Search by name, title, email, handle, or domain
  - Filter pills: *All*, *With Email*, *With LinkedIn*, *High Confidence (≥ 60%)*
  - 1-click email copy
  - Profile links for LinkedIn and GitHub
  - Expandable contact details modal with full discovery notes
  - Export to CSV & JSON
- **Quick Demo Modes**:
  - **Simulate Stream**: Play the streaming sequence client-side for rapid testing
  - **Load Sample Data**: Populate the 85 sample contacts instantly

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Frontend
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Connecting to Backend

The frontend defaults to using the Vite proxy `/api/scan` -> `http://localhost:8000/api/scan`.

### Option A: Your Real Backend
Start your Python / FastAPI / backend service on `http://localhost:8000`.

### Option B: Built-in Mock Streaming Server
To test streaming without running the backend, run:
```bash
npm run mock
```
This runs a local HTTP server on port 8000 that responds to `POST /api/scan` and streams chunks with sample events.

### Option C: Custom Remote URL
Click the gear icon in the top header and enter any custom backend URL (e.g., `http://192.168.1.50:8000`).
