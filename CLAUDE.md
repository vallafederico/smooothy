# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development** (run from `/web`):
```bash
pnpm dev          # Start dev server at localhost:4321
pnpm build        # Build for production
pnpm preview      # Preview production build
```

**Monorepo** (run from root):
```bash
pnpm dev          # Run web + package dev in parallel
pnpm build        # Build all packages
```

## Architecture

### Project Structure
- `/web` - Astro SSR application (main product)
- `/package` - smooothy slider library
- `/docs` - Slider documentation

### Tech Stack
- **Astro 5** with SSR (Node adapter, `output: "server"`)
- **React 19** for interactive components (3D, forms)
- **Three.js + R3F** for WebGL/3D graphics
- **Tailwind CSS v4** via vite plugin
- **GSAP** for animations
- **Lenis** for smooth scrolling

### Path Aliases
```
~/     → src/
@c/    → src/components/
@js/   → src/js/
@svg/  → src/components/svg/
```

### Module System
HTML attribute-based module instantiation:
```html
<element data-module="moduleName" data-type="variant">
```
Modules in `/src/js/modules/` auto-instantiate based on `data-module` attribute.

### Key Singletons (`/src/js/app.ts`)
```typescript
App.scroll  // Lenis scroll manager
App.dom     // DOM module lifecycle
App.gl      // WebGL system
```

### SSR Pages
- `export const prerender = true` → static generation
- `export const prerender = false` → server-rendered

### 3D Components
Location: `/src/components/three/`
- Use `client:only="react"` directive in Astro
- Models in `/public/webgl/*.glb`
- Environment maps in `/public/webgl/*.hdr.jpg`

### API Routes
Location: `/src/pages/api/`
- `/api/faucet` - zkPassport verification + token claims

## Conventions

### Styling
- Tailwind utilities for layout/spacing
- CSS modules in `/src/styles/` for global styles
- User-select disabled by default; enable with `[data-selectable]`

### Components
- React (`.tsx`) for stateful/interactive UI
- Astro (`.astro`) for static content
- Landing components in `/components/landing/`
- 3D components in `/components/three/`

### Embeds
Precog market iframe format:
```html
<iframe src="https://embed.precog.market/market?network=8453&id=MARKET_ID&type=compact&theme=dark&source=chain" width="420" height="315">
```

### Animations
- Respect `prefers-reduced-motion`
- GSAP for complex animations
- CSS keyframes in `/src/styles/animation.css`
