# 🚀 Job Application Tracker — Full-Stack MERN SaaS Application

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://react.dev)
[![React 18](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.19-lightgrey.svg)](https://expressjs.com)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47a248.svg)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8.svg)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-grade, end-to-end **Job Application Tracker** web application engineered for high-growth software engineers and freshers. Built with **React 18, Vite, Tailwind CSS, Node.js, Express.js, MongoDB (Mongoose), JWT authentication in HTTP-only cookies, and Cloudinary storage.**

---

## 📑 Table of Contents

- [Architectural Overview](#-architectural-overview)
- [Key Features](#-key-features)
  - [User Portal](#1-user-portal)
  - [Admin Platform Portal](#2-admin-platform-portal)
- [Security & Authentication Architecture](#-security--authentication-architecture)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Environment Variables Configuration](#-environment-variables-configuration)
- [Local Installation & Setup](#-local-installation--setup)
- [Database Seeding (Admin & Demo Datasets)](#-database-seeding)
- [REST API Reference](#-rest-api-reference)
- [Deployment Instructions](#-deployment-instructions)
- [Resume-Ready Project Highlights (For Freshers)](#-resume-ready-project-highlights)
- [Top Technical Interview Questions & Answers](#-top-technical-interview-questions--answers)

---

## 🏛 Architectural Overview

The application is architected around a clean **Model-View-Controller (MVC) REST API backend** paired with a **Single Page Application (SPA) frontend**.

```text
                                  +---------------------------------------+
                                  |    React 18 + Vite SPA (Client)       |
                                  | (Tailwind CSS, Recharts, Lucide Icons)|
                                  +-------------------+-------------------+
                                                      |
                                          HTTP-only Cookies / Axios
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |     Express.js REST API Server        |
                                  |   (Helmet, CORS, CookieParser, Multer)|
                                  +---------+-------------------+---------+
                                            |                   |
                     +----------------------+                   +--------------------+
                     v                                                               v
         +------------------------+                                      +------------------------+
         |     MongoDB Atlas      |                                      |   Cloudinary Cloud     |
         | (Mongoose Aggregation) |                                      | (Resume PDFs & Assets) |
         +------------------------+                                      +------------------------+
```

---

## ✨ Key Features

### 1. User Portal
* **Live Analytics Dashboard**: KPI cards calculating application count, OA cleared rates, interview rates, and job offers with **Recharts** status donut charts and monthly submission velocity.
* **Stage Timeline Auditing**: Automatic chronological logging of stage transitions (`Applied` $\to$ `Online Assessment` $\to$ `OA Cleared` $\to$ `Interview` $\to$ `Selected` / `Rejected`).
* **Multi-Round Interview Tracker**: Schedule interviews (Technical, Coding, System Design, HR), store video conference links (Google Meet, Zoom, MS Teams), and receive automated email alerts.
* **Advanced Search, Filter, Sort & Pagination**: Real-time multi-criteria filtering by company, job type, source, priority, and application date with server-side pagination.
* **Cloud Resume Management**: Upload resumes (PDF/DOC up to 10MB) directly to **Cloudinary** with instant preview and download options.
* **Profile & Preferences**: Manage developer headlines, bio, technical skills tags, and GitHub/LinkedIn/Portfolio links.

### 2. Admin Platform Portal
* **Platform-Wide Oversight**: Real-time counters of all users, applications, scheduled interviews, and successful placements across the platform.
* **User Management & Moderation**: Paginated user table with ability to search, inspect user application volumes, and toggle account suspensions (`isBlocked`).
* **Cross-User Application Explorer**: Audit and inspect application volume across all companies platform-wide.
* **Suspension Enforcement**: Suspended users are barred from logging in or making authenticated requests.

---

## 🔒 Security & Authentication Architecture

1. **HTTP-only Cookies**: JWTs are signed with secret keys and stored in `SameSite: Lax` (`None` in production with `secure: true`), preventing client-side JavaScript access and eliminating **XSS token theft**.
2. **Password Hashing**: Uses `bcryptjs` with 10 salt rounds before database insertion. Passwords are never stored or logged in plain text.
3. **Role-Based Access Control (RBAC)**: Distinct `protect` and `requireAdmin` middlewares enforce strict backend authorization guards.
4. **Data Isolation**: Queries for user resources strictly filter by `req.user._id`, preventing unauthorized cross-user modifications.
5. **No Password Exposure**: Mongoose `select: false` default ensures password hashes are never leaked in API payloads.

---

## 💻 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router DOM v6, Recharts, Lucide React, Axios |
| **Backend** | Node.js, Express.js, Mongoose ODM, JWT, bcryptjs, cookie-parser, Multer, Helmet, Morgan |
| **Database** | MongoDB Atlas / Local MongoDB instance |
| **Cloud Storage** | Cloudinary SDK (with local disk fallback for zero-config local dev) |
| **Email Service** | Nodemailer (HTML responsive templates) |

---

## 📁 Project Directory Structure

```text
Job Application Tracker/
├── package.json               # Root orchestrator scripts
├── .env.example               # Root environment variable documentation
├── README.md                  # Documentation
│
├── server/                    # Express REST API Backend
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── cloudinary.js      # Cloudinary storage & local fallback handler
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── applicationController.js
│   │   ├── interviewController.js
│   │   ├── resumeController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT cookie verification & user block check
│   │   ├── adminMiddleware.js # RBAC admin guard
│   │   ├── errorMiddleware.js # Centralized Mongoose error handler
│   │   └── uploadMiddleware.js# Multer multipart file upload validator
│   ├── models/
│   │   ├── User.js
│   │   ├── Application.js
│   │   ├── Timeline.js
│   │   └── Interview.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── interviewRoutes.js
│   │   ├── resumeRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   ├── generateToken.js   # JWT signing & HTTP-only cookie helper
│   │   ├── emailService.js    # Nodemailer email notification templates
│   │   └── seedAdmin.js       # Admin CLI seeder
│   ├── seeder.js              # Comprehensive demo dataset seeder
│   └── server.js              # Express app entry
│
└── client/                    # React 18 + Vite SPA Frontend
    ├── src/
    │   ├── components/        # Modals, Badges, StatCards, Pagination, Loaders
    │   ├── context/           # AuthContext & ToastContext
    │   ├── layouts/           # UserLayout, AdminLayout, AuthLayout
    │   ├── pages/
    │   │   ├── public/        # LandingPage, LoginPage, SignupPage, NotFound
    │   │   ├── user/          # Dashboard, Applications, Detail, Interviews, Analytics, Profile, Resumes
    │   │   └── admin/         # AdminDashboard, AdminUsers, AdminUserDetail, AdminApplications
    │   ├── routes/            # ProtectedRoute & AppRoutes
    │   ├── services/          # Axios API client services
    │   ├── App.jsx
    │   └── main.jsx
    └── vite.config.js
```

---

## ⚙️ Environment Variables Configuration

Create a `.env` file in the `server/` directory:

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/job_application_tracker

# JWT
JWT_SECRET=super_secret_jwt_key_job_application_tracker_2026
JWT_EXPIRES_IN=7d
COOKIE_EXPIRES_DAYS=7

# Cloudinary (Optional in dev - local disk storage fallback is enabled)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Nodemailer (Optional in dev - logs preview in console)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
EMAIL_FROM=JobTracker Support <noreply@jobtracker.app>

# Admin Seed
ADMIN_NAME=Platform Administrator
ADMIN_EMAIL=admin@jobtracker.com
ADMIN_PASSWORD=Admin@123456
```

---

## 🚀 Local Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Pritiranjan-Biswal/job-application-tracker.git
cd job-application-tracker
```

### 2. Install all dependencies
```bash
npm run install:all
```

### 3. Seed demo data (Admin, Users, Applications, Interviews, Timeline)
```bash
npm run seed:data
```

### 4. Run the full-stack development environment
```bash
npm run dev
```
* **Frontend**: `http://localhost:5173`
* **Backend API**: `http://localhost:5000/api`

---

## 👥 Demo Login Credentials

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@jobtracker.com` | `Admin@123456` | `/admin/dashboard` & `/dashboard` |
| **User** | `demo@jobtracker.com` | `Demo@123456` | `/dashboard` (User Portal) |

*(Note: The login page includes 1-click demo auto-fill buttons for quick testing)*

---

## 📡 REST API Reference

### Authentication
* `POST /api/auth/signup` — Register a new account (`role: user` enforced)
* `POST /api/auth/login` — Sign in and receive HTTP-only JWT cookie
* `POST /api/auth/logout` — Clear JWT session cookie
* `GET /api/auth/me` — Get current logged-in user profile
* `PUT /api/auth/update-password` — Change account password

### Job Applications
* `GET /api/applications` — Get user applications (supports `search`, `status`, `jobType`, `source`, `sort`, `page`, `limit`)
* `POST /api/applications` — Create a new job application & record initial timeline event
* `GET /api/applications/:id` — Get application by ID with timeline & interviews
* `PUT /api/applications/:id` — Update application (status transitions automatically log timeline events)
* `DELETE /api/applications/:id` — Delete application and cascade remove associated timeline & interview records
* `POST /api/applications/:id/timeline` — Add custom note/milestone to timeline
* `GET /api/applications/stats/dashboard` — MongoDB aggregation pipeline analytics

### Interviews
* `GET /api/interviews` — Get interviews for user (filter by `timeframe=upcoming|past`)
* `POST /api/interviews` — Schedule a new interview round & trigger email alert
* `PUT /api/interviews/:id` — Update interview round details or status
* `DELETE /api/interviews/:id` — Remove an interview

### Resumes
* `GET /api/resumes` — Get resume metadata
* `POST /api/resumes/upload` — Upload resume file (PDF/DOC) to Cloudinary
* `DELETE /api/resumes` — Remove resume

### Admin (Protected by `protect` + `requireAdmin`)
* `GET /api/admin/dashboard` — Platform overview analytics (users, stages, top companies)
* `GET /api/admin/users` — Paginated user table with application counts
* `GET /api/admin/users/:id` — Inspect individual user details & recent activity
* `PATCH /api/admin/users/:id/status` — Toggle user suspension (`isBlocked`)
* `DELETE /api/admin/users/:id` — Delete user and cascade purge their data
* `GET /api/admin/applications` — Platform-wide cross-user application audit

---

## 🌐 Deployment Instructions

### Frontend (Vercel)
1. Push project to GitHub.
2. Import repository on [Vercel](https://vercel.com).
3. Set **Root Directory** to `client`.
4. Set **Build Command** to `npm run build` and **Output Directory** to `dist`.
5. Add Environment Variable:
   ```env
   VITE_API_URL=https://your-backend-api.onrender.com/api
   ```

### Backend (Render / Railway)
1. Create a Web Service on [Render](https://render.com).
2. Set **Root Directory** to `server`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `node server.js`.
5. Add environment variables from `server/.env.example` (especially `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `CLOUDINARY_*`).

---

## 💼 Resume-Ready Project Highlights (For Freshers)

Add these high-impact bullet points to your software developer resume:

* **Architected Full-Stack SaaS Platform**: Developed a scalable MERN application tracking end-to-end job application workflows, stage timeline auditing, multi-round interview reminders, and Cloudinary PDF resume storage.
* **Enterprise Security & RBAC**: Engineered JWT authentication using **HTTP-only SameSite cookies** to safeguard against XSS/CSRF attacks; enforced two-tier **Role-Based Access Control** (`user` and `admin`) with user suspension guards.
* **High-Performance MongoDB Aggregations**: Designed aggregation pipelines to compute stage distribution metrics, month-over-month velocity, and conversion funnel analytics rendered through **Recharts**.
* **REST API & Cloud Integration**: Built RESTful Express endpoints supporting server-side search, multi-criteria filtering, and pagination; integrated **Multer + Cloudinary** for asset management and **Nodemailer** for automated interview alerts.

---

## 🧠 Top Technical Interview Questions & Answers

### Q1: Why use HTTP-only cookies for JWT storage instead of localStorage?
> **Answer**: `localStorage` is accessible by any JavaScript code executing on the page. If the application has an XSS (Cross-Site Scripting) vulnerability, attackers can steal tokens directly. By storing JWTs in **HTTP-only cookies**, the browser prevents JavaScript from accessing the cookie (`document.cookie`), neutralizing token extraction via XSS. Combined with `SameSite: Lax/Strict` and `Secure: true`, it mitigates CSRF attacks as well.

### Q2: How does the application implement stage timeline tracking?
> **Answer**: In `applicationController.js`, whenever an application's status transitions (e.g. from `Applied` to `Online Assessment`), the backend automatically creates a new document in the `Timeline` collection with the timestamp, transition description, and application ID. When querying application details, the timeline entries are populated in chronological order to provide an immutable stage journey.

### Q3: How are dashboard metrics calculated efficiently without frontend loops?
> **Answer**: Rather than loading thousands of application documents to the client and computing statistics in React, we leverage **MongoDB Aggregation Pipelines** (`$match`, `$group`, `$sum`, `$year`, `$month`, `$sort`). This aggregates metrics directly inside the database engine and returns lightweight JSON summaries to the client.

### Q4: How is Role-Based Access Control (RBAC) enforced on the backend?
> **Answer**: RBAC is enforced through composable Express middlewares:
> 1. `protect` middleware extracts the JWT from the HTTP-only cookie, decodes the user ID, verifies the user exists in MongoDB, and checks that `user.isBlocked !== true`.
> 2. `requireAdmin` middleware checks `req.user.role === 'admin'`. If a normal user attempts to access `/api/admin/*`, the server immediately responds with `403 Forbidden`.

---

## 📜 License
MIT License. Created by [Pritiranjan Biswal](https://github.com/Pritiranjan-Biswal).
