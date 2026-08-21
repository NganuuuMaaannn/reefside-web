<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Reefside Surf Co. — Architecture

Single-page scroll-driven brand site. All components are `'use client'`, dynamically imported with `ssr: false`.

## Scroll Sequence (top → bottom)

```
IntroLoader → HeroSection → ScrollVideo (bg) → GallerySection → EditorialScroll → ScrollVideo2 (bg) → SplitSection → OutroSection
```

1. **IntroLoader** — Full-screen logo. Blocks scroll until 3s elapsed + both videos loaded. Fades out via Framer Motion.
2. **HeroSection** — Sticky logo + 3 image cards. Staggered blur/scale-in after intro completes.
3. **ScrollVideo** — Fixed background video scrubbed by GSAP ScrollTrigger over 400vh. Canvas captures first frame as placeholder.
4. **GallerySection** — Fixed overlay that fades in/out based on scroll progress (0.02–0.97). Grid of 3 images.
5. **EditorialScroll** — Scattered absolute-positioned images + text. Each `.ed-reveal` element animates in via GSAP ScrollTrigger (scrub). Second background video (`ScrollVideo2`) loads lazily via IntersectionObserver.
6. **ScrollVideo2** — Second scrubbed video, triggered by EditorialScroll's wrapper entering viewport.
7. **SplitSection** — Two-column image grid. Framer Motion `useScroll`/`useTransform` for linked opacity, Y, and blur. Fades out ScrollVideo2's fixed container.
8. **OutroSection** — Final CTA with logo, "Shop Now" pill button (→ reefsidesurfco.com), Facebook/Instagram links. GSAP timeline scales down SplitSection while fading in outro.

## Utility Components

- **Lightbox** — React Context + portal. Opens fullscreen image overlay on any `LightboxButton` click. Blocks scroll/wheel/keyboard while open. Close via X button or Escape. Blur + scale transition on open/close.
- **SmoothScroll** — Custom lerp smooth scroll (easing 0.14). Disabled during intro. Respects `prefers-reduced-motion` and touch devices. Intercepts wheel events, maps to `requestAnimationFrame` loop.
- **GSAP + ScrollTrigger** — Used for scroll-scrubbed videos, section reveals, gallery fade in/out, and outro timeline. `useGSAP` hook scopes animations to component refs. `scrub: true` or `scrub: 0.6–0.8` ties progress to scroll position.

## Key Files

```
app/page.tsx              — Orchestrator: state for videoReady, video2Ready, introDone
app/components/
  IntroLoader.tsx         — Intro gate (3s + video ready)
  SmoothScroll.tsx        — Lerp scroll (no render, pure DOM)
  ScrollVideo.tsx         — BG video 1 scrub (ripsayd2-scrub.mp4)
  ScrollVideo2.tsx        — BG video 2 scrub (ripsayd4-scrub.mp4)
  HeroSection.tsx         — Logo + cards
  GallerySection.tsx      — Fixed gallery overlay
  EditorialScroll.tsx     — Scattered layout + text
  SplitSection.tsx        — 2-col grid, Framer scroll transforms
  OutroSection.tsx        — CTA + socials
  Lightbox.tsx            — Context provider + overlay + button
```

## Stack

Next.js 16, React 19, Framer Motion 13, GSAP 3.15, Tailwind CSS 4, TypeScript 5.
