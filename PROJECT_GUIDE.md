# Xenelasia Landing Page - Project Guide

This guide provides an overview of the system architecture, directory structure, configuration settings, and details on how to run and manage the static application.

---

## 1. Project Architecture Overview

The project is structured as a static **Next.js** frontend application.

```
Webinar (Root Workspace)
├── frontend/         # Next.js App Router (React + Tailwind CSS)
├── package.json      # Root package file linking scripts
```

### Frontend Component (`/frontend`)
* **Framework**: [Next.js](https://nextjs.org/) App Router (React + TypeScript).
* **Styling**: Tailwind CSS for UI and responsiveness, plus glassmorphism components.
* **Animations**: Framer Motion for smooth transitions, alongside a premium 3D Canvas element (`ThreeBackground.tsx`) using Three.js for interactive particle background graphics.
* **Routing**: Next.js App Router folders:
  * `/` (Home page / Static Landing Page)

---

## 2. Command Scripts Guide

You should run all commands from the **root workspace directory** (`c:\Users\DELL\Desktop\Webinar`). The scripts are configured to manage the frontend folder automatically.

| Script Command | What It Does | When to Use It |
| :--- | :--- | :--- |
| **`npm run install:all`** | Installs all Node modules in the frontend folder. | Run this when setting up the project for the first time or after pulling updates. |
| **`npm run dev`** | Runs the frontend on port `3000`. | Use this for active local development. |
| **`npm run build`** | Builds the frontend (Next.js export) for production. | Run this to verify code builds without compilation or routing errors. |
| **`npm start`** | Starts production servers for the frontend. | Run this to launch the compiled app in production mode. |

---

## 3. Data Mocking

The webinars and blogs are completely static and mocked within the codebase. There is no active database or backend API connected to this project anymore.
