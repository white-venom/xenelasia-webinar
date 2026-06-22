# Xenelasia Landing Page — Project Explanation

This document explains the project architecture, the tools and technologies used, and what specific files/libraries are used for what features.

---

## 1. Project Architecture Overview

The system is structured as a static **Next.js** frontend landing page:
It is a client-facing Next.js application designed with futuristic, responsive layout design, glassmorphism cards, and interactive 3D particle graphics.

```
Webinar (Root Workspace)
├── frontend/                 # Client UI (Next.js App Router + Tailwind CSS + Three.js)
│   ├── src/app/              # Next.js Pages (Routes) and Layouts
│   └── src/components/       # Shared UI Components (Navbar, 3D Canvas, Chatbot)
└── package.json              # Monorepo Orchestration (Start/Build concurrent scripts)
```

---

## 2. Technology Stack: What We Use For What

Here is a comprehensive breakdown of every major technology, framework, and package used in this project and why they were chosen:

### 2.1 Core Frameworks & Runtime
*   **Node.js**: The runtime environment executing JavaScript/TypeScript code.
*   **Next.js (v16)**: The React framework powering the frontend.
    *   *Used for:* Routing via the Next.js App Router, handling SSR (Server-Side Rendering) for static layouts, and providing client-side hydration for dynamic page features.
*   **TypeScript**: A typed superset of JavaScript.
    *   *Used for:* Bringing static type checks to frontend directories, catching syntax and object mapping errors before compilation.

### 2.2 Styling, UI, & Animations
*   **Tailwind CSS (v4)**: A utility-first CSS framework.
    *   *Used for:* Structuring layout systems, dark-themed styling (slate-950), sizing, spacing, glassmorphic card overlays, responsive designs (mobile vs desktop), and custom neon typography glows.
*   **Three.js**: A cross-browser 3D JavaScript library.
    *   *Used for:* Rendering the premium custom particle network element (`ThreeBackground.tsx`) running at 60 FPS behind the text. It computes particle connections, node repulsion during mouse movements, and automatic scene rotation.
*   **Framer Motion**: An animation library for React.
    *   *Used for:* Smooth scale and position transformations when pages load, modal entries, chat window slide-ups, and interactive button hover/click micro-animations.
*   **Lucide React**: Vector icon pack library.
    *   *Used for:* Displaying crisp symbols throughout the UI (such as security shields, key locks, checkmarks, download buttons, calendar grids, and user avatars).

---

## 3. Directory and File Breakdown: What Lives Where

### 3.1 Frontend Directory Structure
*   [globals.css](file:///c:/Users/DELL/Desktop/Webinar/frontend/src/app/globals.css): Sets core theme design colors, custom scrollbars, and print layout directives (disabling unnecessary sections when printing certificates).
*   [layout.tsx](file:///c:/Users/DELL/Desktop/Webinar/frontend/src/app/layout.tsx): Defines the root layout framework, default metadata descriptors, and embeds responsive fonts.
*   [page.tsx](file:///c:/Users/DELL/Desktop/Webinar/frontend/src/app/page.tsx): The main home landing page. Features hero banners, scroll-linked animations, filtered static blog/webinar cards, and a contact form.
*   [Navbar.tsx](file:///c:/Users/DELL/Desktop/Webinar/frontend/src/components/Navbar.tsx): Global sticky navigation component.
*   [ThreeBackground.tsx](file:///c:/Users/DELL/Desktop/Webinar/frontend/src/components/ThreeBackground.tsx): An interactive 3D WebGL particle network built using Three.js.
*   [AIChatbot.tsx](file:///c:/Users/DELL/Desktop/Webinar/frontend/src/components/AIChatbot.tsx): A client-side slide-out dialog widget.
