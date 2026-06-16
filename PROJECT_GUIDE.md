# Webinar Management & Registration Portal - Project Guide

This guide provides an overview of the system architecture, directory structure, configuration settings, credentials, and details on how to run and manage the application.

---

## 1. Project Architecture Overview

The project is structured as a **monorepo** consisting of two main sub-applications:

```
Webinar (Root Workspace)
├── backend/          # Express API server (TypeScript + Prisma ORM)
├── frontend/         # Next.js App Router (React + Tailwind CSS)
├── package.json      # Root package file linking scripts for both folders
├── docker-compose.yml# Local PostgreSQL database container configuration
└── .env              # Root environment configurations
```

### 1.1 Backend Component (`/backend`)
* **Framework**: [Express.js](https://expressjs.com/) with TypeScript.
* **Database Access**: [Prisma ORM](https://www.prisma.io/). Configured to use a local **SQLite** database file by default (no Docker required).
* **Key Features**:
  * **Authentication**: JWT token-based authentication (sign up, log in, view/edit profile).
  * **Registrations**: Creates unique registration IDs and base64 QR codes for users registering for webinars.
  * **Webinars**: CRUD endpoints for managing scheduled webinars.
  * **Blogs**: Endpoints for displaying announcements and technical cybersecurity blogs.
  * **Certificates**: Automatically issues and serves PDF/HTML completion certificates for attended webinars.
  * **Chatbot**: An interactive simulated AI chatbot assistant endpoint.

### 1.2 Frontend Component (`/frontend`)
* **Framework**: [Next.js](https://nextjs.org/) App Router (React + TypeScript).
* **Styling**: Tailwind CSS for UI and responsiveness, plus glassmorphism components.
* **Animations**: Framer Motion for smooth transitions, alongside a premium 3D Canvas element (`ThreeBackground.tsx`) using Three.js for interactive particle background graphics.
* **Routing**: Next.js App Router folders:
  * `/` (Home page)
  * `/login` (Login screen)
  * `/register` (User registration screen)
  * `/dashboard` (User dashboard to view registrations and download certificates)
  * `/admin` (Administrator portal to add webinars, blogs, and manage user attendance status)

---

## 2. Command Scripts Guide

You should run all commands from the **root workspace directory** (`c:\Users\DELL\Desktop\Webinar`). The scripts are configured to manage both sub-folders automatically.

| Script Command | What It Does | When to Use It |
| :--- | :--- | :--- |
| **`npm run install:all`** | Installs all Node modules in the backend and frontend folders. | Run this when setting up the project for the first time or after pulling updates. |
| **`npm run dev`** | Runs both backend (port `5000`) and frontend (port `3000`) concurrently. | Use this for active local development. |
| **`npm run db:push`** | Synces the Prisma schema to the database without generating migrations. | Use this when initializing your database or after modifying `schema.prisma`. |
| **`npm run db:seed`** | Runs the seed script to populate mock users, webinars, and blogs. | Run this once right after setting up the database. |
| **`npm run prisma:generate`** | Re-generates the local Prisma Client types based on your schema. | Run this after modifying the `schema.prisma` file. |
| **`npm run build`** | Builds both backend (TS compile) and frontend (Next.js export) for production. | Run this to verify code builds without compilation or routing errors. |
| **`npm start`** | Starts production servers for both backend and frontend. | Run this to launch the compiled app in production mode. |

---

## 3. Seed Login Credentials

Once the database has been seeded using `npm run db:seed`, the following accounts are created for testing:

### 3.1 Administrator Account
* **Email Address**: `admin@xenelasia.com`
* **Password**: `admin123`
* **Access Level**: Full admin portal access (`/admin`) to create webinars, publish blogs, and view or change user status (e.g. marking them as "ATTENDED" so they can receive certificates).

### 3.2 Standard User Account
* **Email Address**: `john.doe@example.com`
* **Password**: `user123`
* **Access Level**: General dashboard access (`/dashboard`) to view registered webinars, view their entry QR codes, and download participation certificates for attended events.

---

## 4. Setup Options (SQLite vs. PostgreSQL)

### Option A: Running with SQLite (Zero-Docker Setup - Currently Active)
By default, the application is set up to run using SQLite, which saves data to a local file and requires no external software.
1. Sync tables to initialize the SQLite database file:
   ```bash
   npm run db:push
   ```
2. Seed the database with sample users and webinar details:
   ```bash
   npm run db:seed
   ```
3. Start the dev servers:
   ```bash
   npm run dev
   ```

### Option B: Switching to PostgreSQL (Docker-based Setup)
If you wish to switch back to PostgreSQL:
1. Turn on **Docker Desktop**.
2. Open `/backend/prisma/schema.prisma` and change the database provider to `postgresql`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Open the root `.env` and `/backend/.env` files and change `DATABASE_URL` back to the Postgres connection string:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/webinar_db?schema=public"
   ```
4. Start the database container:
   ```bash
   docker compose up -d
   ```
5. Sync and seed:
   ```bash
   npm run db:push
   npm run db:seed
   ```
