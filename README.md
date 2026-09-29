# ⚖️ Legal Metrix AI

> **AI-powered product compliance inspection platform for regulatory enforcement officers.**  
> Built for speed, accuracy, and accountability — powered by Google Gemini Vision AI.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-61DAFB.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)](https://www.mongodb.com/atlas)
[![Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-black.svg)](https://vercel.com/)
[![Backend on Render](https://img.shields.io/badge/Backend-Render-46E3B7.svg)](https://render.com/)

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Data Models](#-data-models)
- [API Endpoints](#-api-endpoints)
- [Authentication Flow](#-authentication-flow)
- [Environment Variables](#-environment-variables)
- [Pages & Routing](#-pages--routing)
- [Role-Based Access Control](#-role-based-access-control)

---

## 🧠 About the Project

**Legal Metrix AI** is a full-stack, role-based web application designed to digitize and automate the process of product labeling compliance inspections under legal metrology regulations.

Field officers can **photograph packaged products**, and the platform automatically uses **Google Gemini Vision AI** to extract label data (MRP, manufacturer details, net quantity, dates, etc.), run it against **configurable compliance rules**, generate a **compliance score**, and flag violations.

Non-compliant products trigger a structured **seizure memo** workflow. All inspections can be **submitted to admin for official record**, reviewed, approved, or sent back for correction — all tracked with auto-generated case numbers (`LM/YEAR/XXXXX`).

Admins get a full **management dashboard** with analytics, officer performance tracking, inspection oversight, and complete rule configuration — all in one place.

---

## ✨ Key Features

### 🤖 AI-Powered Product Scanning
- Upload **1–5 product images** per inspection
- Google **Gemini Vision AI** extracts label data automatically (MRP, net quantity, manufacturer name, consumer care contact, manufacturing date, address)
- **Multi-image merging** — results from all images are merged using a confidence-score algorithm; the highest-confidence value per field wins
- Graceful fallback: partial failure handled (if 1 of 3 images fails, the other 2 still count)
- **Camera capture** support directly from the browser

### ✅ Dynamic Compliance Rule Engine
- Compliance rules are fully **database-driven** — not hardcoded
- Each rule has: `field`, `label`, `required`, `severity` (low / medium / high)
- Admins can **add, edit, or delete** rules at any time — changes take effect on the next scan
- Violations are categorized by severity; a weighted **compliance score (0–100)** is calculated
- Status automatically assigned: `pass` / `fail` / `review`

### 📋 Seizure Memo Generation
- Auto-generated for **failed (non-compliant)** inspections
- Officers fill in: samples seized, samples released, disposal note, reasons to believe
- Memo data stored in DB; **PDF download** available via PDFKit

### 📁 Submission & Review Workflow
- Officers **submit** completed inspections for admin record
- Auto-generated **case numbers** follow format: `LM/YYYY/XXXXX`
- Admin reviews pending submissions: **Approve** or **Send Back** with remarks
- Full audit trail: who submitted, when; who reviewed, when; remarks stored

### 📊 Analytics & Dashboard
- Officer dashboard: recent inspections, pass/fail stats, quick scan access
- Analytics page: charts (via Recharts) — compliance trends, violation breakdowns, score distribution
- Admin dashboard: system-wide KPIs — total inspections, pass rate, officer count, compliance %

### 👥 Admin Control Panel
- **Overview** — Live system stats
- **Officers** — List all officers with individual scan counts & pass rates
- **Inspections** — Filter by officer, status, date range; full pagination
- **Submissions** — Pending review inbox; approve or send back
- **Rules** — Full CRUD for compliance rules with severity management

### 🔐 Authentication & Security
- JWT-based authentication (7-day token)
- Bcrypt password hashing (salt rounds: 10)
- Role-based access control: `admin` vs `officer`
- Protected routes on both frontend and backend
- Officers can only access their own inspections; admins can access all

### 📸 Image Management
- Product images uploaded and stored on **Cloudinary CDN**
- Multer handles multipart/form-data (up to 5 images per inspection)
- Images stored as URLs in MongoDB; original buffers processed by Gemini

### 📄 PDF Report Generation
- Inspection reports downloadable as PDFs using **PDFKit**
- Includes product details, extracted data, violations, compliance score, seizure memo

---

## 🛠️ Tech Stack

### Frontend

| Category | Technology | Version |
|---|---|---|
| Framework | React | ^19.2.8 |
| Build Tool | Vite | ^8.2.2 |
| Routing | React Router DOM | ^7.18.3 |
| Styling | Tailwind CSS | ^4.3.3 |
| Charts | Recharts | ^3.10.1 |
| Icons | Lucide React | ^1.43.0 |
| HTTP Client | Axios | ^1.20.0 |
| Linter | ESLint | ^10.9.0 |
| Deployment | Vercel | — |

### Backend

| Category | Technology | Version |
|---|---|---|
| Runtime | Node.js | v18+ |
| Framework | Express.js | ^5.2.1 |
| Database | MongoDB + Mongoose | ^9.9.5 |
| AI / Vision | Google Gemini (`@google/generative-ai`) | 0.21.0 |
| Authentication | JSON Web Token (JWT) | ^9.0.3 |
| Password Hashing | Bcryptjs | ^3.0.3 |
| Image Upload | Multer + Cloudinary | ^2.3.0 / ^2.11.0 |
| PDF Generation | PDFKit | ^0.20.2 |
| HTTP Client | Axios | ^1.20.0 |
| Environment | Dotenv | ^17.4.2 |
| CORS | cors | ^2.8.6 |
| Deployment | Render | — |

---

## 📁 Project Structure

```
Legal Metrix AI/
│
├── backend/                          # Node.js + Express REST API
│   ├── server.js                     # App entry point — mounts all routes
│   ├── .env                          # Environment variables (not committed)
│   ├── .env.example                  # Example env template
│   ├── package.json
│   └── src/
│       ├── config/
│       │   ├── db.js                 # MongoDB connection via Mongoose
│       │   ├── multer.js             # Multer setup + Cloudinary upload helper
│       │   └── cloudinary.js         # Cloudinary SDK configuration
│       │
│       ├── controllers/
│       │   ├── authController.js     # Register & Login logic
│       │   ├── inspectionController.js # Inspection CRUD + AI pipeline + submission workflow
│       │   ├── dashboardController.js  # Officer dashboard stats
│       │   ├── analyticsController.js  # Analytics charts data
│       │   ├── reportController.js     # PDF report generation
│       │   └── admin/
│       │       └── ruleController.js   # Rule CRUD (admin only)
│       │
│       ├── middleware/
│       │   ├── authMiddleware.js     # JWT verification — attaches req.user
│       │   ├── roleMiddleware.js     # Role-based authorization (admin / officer)
│       │   └── admin/
│       │       └── adminOnly.js      # Shorthand middleware for admin-only routes
│       │
│       ├── models/
│       │   ├── User.js               # User schema (name, email, password, role)
│       │   ├── Inspection.js         # Core inspection schema (images, violations, seizure memo, submission)
│       │   └── Rule.js               # Compliance rule schema (field, severity, required)
│       │
│       ├── routes/
│       │   ├── authRoutes.js         # POST /register, POST /login, GET /me
│       │   ├── inspectionRoutes.js   # Inspection CRUD + seizure memo + submission
│       │   ├── analyticsRoutes.js    # GET /stats
│       │   ├── dashboardRoutes.js    # Officer dashboard stats
│       │   ├── reportRoutes.js       # PDF report generation
│       │   ├── aiRoutes.js           # Direct AI extraction endpoint
│       │   ├── upload.js             # Image upload route
│       │   └── admin/
│       │       ├── admin.js          # Admin stats, officers list, inspections (filtered)
│       │       └── ruleRoutes.js     # Rule CRUD routes (admin-only write access)
│       │
│       ├── services/
│       │   └── geminiService.js      # Google Gemini Vision AI — extraction + multi-image merge
│       │
│       └── utils/
│           └── ruleEngine.js         # Compliance scoring engine — runs rules against extracted data
│
└── legal metrix-ai/                  # React + Vite Frontend
    ├── index.html
    ├── vite.config.js
    ├── vercel.json                   # SPA rewrite rules for Vercel deployment
    ├── package.json
    └── src/
        ├── main.jsx                  # React entry point
        ├── App.jsx                   # Root router — all page routes defined here
        ├── index.css                 # Global styles
        │
        ├── api/                      # Axios API call modules
        │
        ├── context/
        │   └── AuthContext.jsx       # Global auth state — user, token, login/logout
        │
        ├── components/
        │   ├── Navbar.jsx            # Top navigation bar
        │   ├── Layout.jsx            # Officer layout wrapper
        │   ├── AuthModal.jsx         # Login / Register modal
        │   ├── ProtectedRoute.jsx    # Route guard (checks auth + optional role)
        │   ├── CameraCapture.jsx     # Browser camera access for image capture
        │   ├── EvidencePanel.jsx     # Displays captured evidence / product images
        │   ├── NotificationBell.jsx  # Notification indicator
        │   ├── Toast.jsx             # Toast notification component
        │   └── admin/
        │       └── AdminLayout.jsx   # Admin panel sidebar layout
        │
        └── pages/
            ├── LandingPage.jsx       # Public marketing / hero page
            ├── Dashboard.jsx         # Officer home — stats + recent inspections
            ├── ScanProduct.jsx       # AI scanning workflow — upload, extract, result
            ├── History.jsx           # Officer's full inspection history
            ├── Analytics.jsx         # Charts + compliance analytics
            └── admin/
                ├── AdminOverview.jsx   # Admin home — system-wide stats
                ├── AdminOfficer.jsx    # Officers list with individual stats
                ├── AdminInspection.jsx # All inspections with filters + pagination
                ├── AdminRule.jsx       # Rule management (CRUD)
                └── AdminSubmission.jsx # Submission review inbox
```

---

## 🗃️ Data Models

### User

```js
{
  name:      String   // required
  email:     String   // required, unique, lowercase
  password:  String   // required, bcrypt hashed
  role:      String   // enum: ['admin', 'officer'], default: 'officer'
  createdAt: Date     // auto (timestamps)
  updatedAt: Date     // auto (timestamps)
}
```

### Inspection

```js
{
  productName:    String            // required — user-provided product name
  images:        [String]           // array of Cloudinary CDN URLs (up to 5)
  extractedData:  Object            // raw AI-extracted label data from Gemini
  violations: [{
    field:      String,             // which field violated (e.g. "mrp")
    message:    String,             // human-readable violation reason
    severity:   String              // 'low' | 'medium' | 'high'
  }]
  complianceScore: Number           // 0-100 weighted score
  status:        String             // enum: ['pass', 'fail', 'review']
  officer:       ObjectId -> User   // which officer performed the inspection

  seizureMemo: {
    samplesSeized:    Number
    samplesReleased:  Number
    disposalNote:     String
    reasonsToBelieve: String
    generatedBy:      ObjectId -> User
    generatedAt:      Date
  }

  submission: {
    status:      String     // enum: ['draft', 'submitted', 'approved', 'sent_back']
    caseNumber:  String     // auto-generated format: LM/YYYY/XXXXX
    submittedAt: Date
    reviewedBy:  ObjectId -> User
    reviewedAt:  Date
    adminRemarks: String
  }

  createdAt: Date           // auto
  updatedAt: Date           // auto
}
```

### Rule

```js
{
  ruleId:      String    // required, unique (e.g. "R001")
  field:       String    // required (e.g. "mrp", "netQuantity", "manufacturer")
  label:       String    // required (human-readable label, e.g. "MRP Declaration")
  required:    Boolean   // default: true
  severity:    String    // enum: ['low', 'medium', 'high'], default: 'high'
  description: String    // optional explanation of the rule
  createdAt:   Date      // auto
  updatedAt:   Date      // auto
}
```

---

## 🔌 API Endpoints

> **Base URL (local):** `http://localhost:5000/api`  
> All protected routes require `Authorization: Bearer <JWT_TOKEN>` header.

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new user |
| `POST` | `/auth/login` | Public | Login, returns JWT token |
| `GET` | `/auth/me` | Any logged-in user | Get current user profile |
| `GET` | `/auth/admin-only` | Admin only | Admin access test route |

### Inspections

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/inspections` | Officer | Create inspection — upload images, runs AI + rule engine |
| `GET` | `/inspections` | Any | Get inspections (officers see own; admin sees all) |
| `GET` | `/inspections/submissions` | Admin | Get all submitted inspections pending review |
| `GET` | `/inspections/:id` | Any | Get single inspection (access-controlled) |
| `POST` | `/inspections/:id/seizure-memo` | Officer/Admin | Generate seizure memo for a failed inspection |
| `POST` | `/inspections/:id/submit` | Officer | Submit inspection for official admin record |
| `POST` | `/inspections/:id/review` | Admin | Approve or send back a submitted inspection |

### Rules (Compliance Rule Engine)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/rules` | Any | Get all compliance rules |
| `POST` | `/rules` | Admin | Create a new rule |
| `PATCH` | `/rules/:id` | Admin | Update an existing rule |
| `DELETE` | `/rules/:id` | Admin | Delete a rule |

### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/admin/stats` | Admin | System-wide stats (total inspections, pass/fail/review, officer count, compliance %) |
| `GET` | `/admin/officers` | Admin | All officers + individual scan count, pass count, pass rate, joined date |
| `GET` | `/admin/inspections` | Admin | All inspections with filters: `officer`, `status`, `startDate`, `endDate`, `page`, `limit` |

### Analytics & Dashboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/analytics/stats` | Any | Analytics data for charts |
| `GET` | `/dashboard` | Officer | Officer dashboard stats |

### Reports & Upload

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/reports/generate/:id` | Any | Generate and download PDF report for an inspection |
| `POST` | `/upload` | Any | Upload image(s) to Cloudinary |
| `GET` | `/health` | Public | Server health check |

---

## 🔐 Authentication Flow

```
CLIENT (Browser)
    |
    | POST /api/auth/login { email, password }
    |
    v
SERVER (Express)
    1. Find user by email in MongoDB
    2. bcrypt.compare(password, hashedPassword)
    3. If match: jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '7d' })
    4. Return: { token, user: { id, name, email, role } }
    |
    v
CLIENT stores token in AuthContext / localStorage
    |
    | All subsequent requests include:
    | Header: Authorization: Bearer <token>
    |
    v
authMiddleware.js (protect)
    - jwt.verify(token, JWT_SECRET) -> decoded { id, role }
    - User.findById(id) -> attaches req.user
    - Calls next() or returns 401 Unauthorized
    |
    v
roleMiddleware.js (authorize)
    - Checks req.user.role === requiredRole
    - Returns 403 Forbidden if role mismatch

Role Hierarchy:
  admin   -> Full system access
  officer -> Own inspections only
```

---

## 🌍 Environment Variables

### Backend (`backend/.env`)

```env
# Server
PORT=5000

# MongoDB Atlas
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/legalmetrix

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Cloudinary (Image CDN)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend (`legal metrix-ai/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

> **Never commit `.env` files to version control.** Use `.env.example` as a template.

---



## 📱 Pages & Routing

### Officer Routes

| Path | Page | Description |
|---|---|---|
| `/` | `LandingPage` | Public marketing/hero page; redirects logged-in users |
| `/dashboard` | `Dashboard` | Officer home — stats, recent inspections, quick scan |
| `/scan` | `ScanProduct` | Full AI scanning workflow |
| `/history` | `History` | Complete inspection history with filters |
| `/analytics` | `Analytics` | Compliance analytics with charts |

### Admin Routes

| Path | Page | Description |
|---|---|---|
| `/admin` | `AdminOverview` | System-wide stats and KPIs |
| `/admin/officers` | `AdminOfficer` | All officers with performance metrics |
| `/admin/inspections` | `AdminInspection` | All inspections with advanced filtering and pagination |
| `/admin/rules` | `AdminRule` | Compliance rule management (CRUD) |
| `/admin/submissions` | `AdminSubmission` | Pending submission review inbox |

> All routes under `/dashboard`, `/scan`, `/history`, `/analytics` are guarded by `ProtectedRoute`.  
> All `/admin/*` routes require both authentication **and** `role === 'admin'`.

---

## 🛡️ Role-Based Access Control

| Feature | Officer | Admin |
|---|---|---|
| View own inspections | Yes | Yes |
| View all inspections | No | Yes |
| Create inspections (scan) | Yes | Yes |
| Generate seizure memo | Own only | Yes |
| Submit inspection for record | Own only | Yes |
| Review / Approve submissions | No | Yes |
| View analytics | Yes | Yes |
| View rules (read) | Yes | Yes |
| Create / Edit / Delete rules | No | Yes |
| View officer list + stats | No | Yes |
| View system-wide admin stats | No | Yes |
| Access admin panel | No | Yes |

---



## 📝 License

This project is licensed under the **ISC License**.

---

<p align="center">Built with love using Google Gemini AI, React, and Node.js</p>
