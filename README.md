# Reefside Surf Co.

A single-page, scroll-driven brand website for Reefside Surf Co. — a homegrown Davao surf brand since 2006.

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**
- **Framer Motion 13** — intro sequences, scroll indicator, section transitions
- **GSAP 3.15 + ScrollTrigger** — scroll-scrubbed videos, section reveals, editorial layout

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  page.tsx                    — Main orchestrator
  globals.css                 — Global styles + fluid button
  components/
    IntroLoader.tsx           — Full-screen logo gate (3s + video ready)
    HeroSection.tsx           — Sticky logo + product cards + scroll indicator
    SmoothScroll.tsx          — Custom lerp smooth scroll (no render, pure DOM)
    ScrollVideo.tsx           — Background video 1 (scrubbed by scroll)
    ScrollVideo2.tsx          — Background video 2 (scrubbed by scroll)
    GallerySection.tsx        — Fixed gallery overlay (fade by scroll progress)
    EditorialScroll.tsx       — Scattered editorial images + text
    SplitSection.tsx          — Two-column image grid with Framer scroll transforms
    OutroSection.tsx          — Final CTA + social links
    Lightbox.tsx              — Fullscreen image overlay (context + portal)
    RobustImage.tsx           — Image component with fallback handling
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
