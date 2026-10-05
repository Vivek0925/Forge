# Vynor Landing Page Rules

- Before making any changes, inspect the existing repository structure,
  especially the Next.js app, marketing/landing-page files, components,
  styles, fonts, theme tokens, and content files.
- Do not assume that paths, components, tokens, or files mentioned below
  already exist. If they do not exist, follow the existing project structure
  and patterns instead of creating duplicate structures unnecessarily.

- Use Next.js (App Router) + TypeScript, Tailwind CSS v4, and Framer Motion.
- Identify the existing location of the marketing/landing page and its
  components before making changes. Reuse the existing structure.
- Identify the existing color/theme tokens in `globals.css` before using
  colors. Prefer existing `@theme` tokens such as coral, cream, blue, sage,
  forest, butter, and ink if they exist. Never hardcode hex values in
  components.
- Inspect the existing font configuration before making typography changes.
  If Inter Tight via `next/font` is already configured, reuse it. Do not
  introduce another font unnecessarily.
- Use Framer Motion for animations and respect `useReducedMotion`.
- Use `"use client"` only when required by client-side state, browser APIs,
  event handlers, or Framer Motion.
- Do not copy the reference HTML wholesale. Rebuild the design as small,
  reusable React components using the project's existing patterns and
  Tailwind classes.
- Inspect how landing-page copy is currently organized. If a content file
  such as `content/landing.ts` already exists, keep pricing, FAQ, headlines,
  and other marketing copy there rather than duplicating it in components.
- Reuse existing UI components, utilities, design tokens, and patterns before
  creating new ones.
- Keep the landing page responsive across mobile, tablet, and desktop.
- Keep animations subtle, intentional, and performant.
- Do not introduce unnecessary dependencies.
- Keep existing Prisma schema, backend routes, API contracts, authentication,
  and application logic untouched while working on the landing page.
- Do not modify unrelated files.
- Before implementing a feature, understand the existing implementation and
  make the smallest reasonable changes required.