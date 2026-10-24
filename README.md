# CivicTrack — Community Issue Reporting & Follow-up Portal

A modern, responsive, and transparent municipal issue tracking platform built with **React + Vite + Tailwind CSS + Recharts** on the frontend (`client/`) and **Express + MongoDB (Mongoose) + Zod** on the backend (`server/`).

> **Note:** Sample records are labelled **DEMO** and are not connected to any government department.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v20+ recommended)
- MongoDB instance running locally on `mongodb://127.0.0.1:27017` or a free MongoDB Atlas connection string.

### 1. Backend Setup
```bash
cd server
copy .env.example .env      # on macOS/Linux: cp .env.example .env
# Edit .env to set your MONGODB_URI, a 32+ char JWT_SECRET, and DEMO_PASSWORD
npm install
npm run seed -- --accounts  # Provisions demo reports + demo accounts (dev only)
npm run dev                 # Starts API server on http://localhost:4000
```

### 2. Frontend Setup (in a separate terminal)
```bash
cd client
copy .env.example .env      # on macOS/Linux: cp .env.example .env
npm install
npm run dev                 # Starts Vite dev server on http://localhost:5173
```
*Note:* In local development, Vite automatically proxies `/api` and `/uploads` requests directly to `http://localhost:4000`.

### 3. Monorepo Scripts (from project root)
```bash
npm run dev:server    # Run backend dev server
npm run dev:client    # Run frontend dev server
npm run build:client  # Compile frontend production bundle
npm run test:server   # Run backend test suite
```

---

## 🔑 Demo Accounts & Evaluation Script

Password for all pre-seeded demo accounts is the `DEMO_PASSWORD` configured in `server/.env` (default: `ChangeMe-Demo-123`):

| Role | Email | Capabilities |
| :--- | :--- | :--- |
| **Citizen** | `citizen@demo.civictrack.test` | File complaints, attach photos, track personal history, view duplicate warnings |
| **Municipal Staff** | `staff@demo.civictrack.test` | View incoming queue, triage priority, route departments, update status & audit notes |
| **Administrator** | `admin@demo.civictrack.test` | Provision staff accounts, enable/disable access privileges |

*(Tip: On the `/login` page, click any of the **"Judge & Evaluator Demo Logins"** chips to autofill credentials instantly.)*

### Judge Walkthrough
1. **Report an Issue**: Sign in as `citizen@demo.civictrack.test` → **File Report** → Enter title, category, location, and upload photo → Submit and note the Ticket ID.
2. **Track Live Progress**: Open **Track Ticket** → Enter the Ticket ID → Inspect the 4-stage visual stepper and public timeline.
3. **Staff Triage**: Sign out and sign in as `staff@demo.civictrack.test` → **Staff Console** → Locate ticket → Assign Department (e.g. *Public Works*), set Priority to *Urgent*, and update Status to *In Progress* with a progress note.
4. **Verified Resolution**: On the staff console, advance Status to *Resolved* with formal resolution details → Revisit **Track Ticket** to see the public resolution banner.
5. **Open City Transparency**: Open `/transparency` to inspect real-time aggregate charts (Donut lifecycle, Ward performance bar chart, and Category breakdown).

---

## 🔒 Security & Privacy Architecture

- **Authentication & RBAC**: JWT issued in `httpOnly`, `SameSite` cookies. Active user and role permissions are loaded freshly from MongoDB on each request.
- **CSRF Defense**: Custom required `X-Requested-With: civictrack` header check on state-changing requests + strict CORS origin allow-list + SameSite cookie policies.
- **File Upload Hardening**: Multer in-memory buffers with magic-byte binary header inspection (supporting JPEG, PNG, and WebP); filenames randomized as 32-character hex; directory traversal strictly blocked on serving.
- **Privacy Protections**: `publicReport` utility filters out internal notes, reporter IDs, and actor IDs from public feeds. Complaints flagged as anonymous conceal submitter details even from municipal staff views.
- **Rate Limiting**: Tiered IP rate limiting on global API routes, auth endpoints, report creation, and abuse submissions.

---

## 🌐 Production Deployment

### 1. Backend (e.g., Render, Railway, Fly.io)
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `NODE_ENV=production`
  - `PORT=4000` (or host assigned `$PORT`)
  - `MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/civictrack`
  - `JWT_SECRET=<32+ random characters>`
  - `FRONTEND_URL=https://<your-frontend-domain>`
  - `UPLOAD_MAX_MB=3`

> [!IMPORTANT]
> Uploaded images are stored in `server/uploads/` on local disk. For cloud deployments with ephemeral containers (such as free-tier Render or Fly.io), configure persistent disk storage or S3/Cloudinary object storage.

### 2. Frontend (e.g., Vercel, Netlify)
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL=https://<your-backend-api-url>`
- **SPA Routing**: `client/vercel.json` is pre-configured with rewrites to route client-side React routes to `index.html`.

> [!NOTE]
> Cross-site cookies between separate frontend and backend domains require HTTPS on both ends (`SameSite=None; Secure`).
