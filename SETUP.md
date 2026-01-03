# Setup Guide

Follow these steps to customize this starter template for your package:

## 1. Update Package Information

### Root `package.json`
- Update `name`, `author`, `description`
- Update `repository`, `bugs`, `homepage` URLs
- Update `keywords` array
- Update `unpkg` path to match your package name

### `package/package.json`
- Update `name` to match your package name
- Update `unpkg` path

### `bin/build.ts`
- Update `globalName` variable (line ~38) - this is the global name for browser builds
- Update `bundleName` variable (line ~39) - this should match your package name (e.g., `your-package.min.js`)

## 2. Update Package Code

### `package/src/core.ts`
Replace the template `Core` class with your actual package implementation.

### `package/src/utils.ts`
Add your utility functions or remove if not needed.

### `package/index.ts`
Update exports to match what your package provides.

## 3. Update Documentation Site

### `web/astro.config.mjs`
- Update `site` URL to your deployment URL

### `web/src/layouts/Layout.astro`
- Update `<title>` and meta description
- Update OG image path if needed

### `web/src/components/Nav.astro`
- Update package name in the logo
- Update GitHub and other links

### `web/src/components/landing/Hero.astro`
- Update package name
- Update description
- Update GitHub links
- Customize the design to match your brand

### `web/src/components/Footer.astro`
- Update copyright year and name
- Update social links

## 4. Clean Up Documentation

The `docs/` folder contains example documentation. Either:
- Remove files you don't need
- Replace with your own documentation
- Keep as examples and add your own

## 5. Update README

Replace `readme.md` with your package's README. You can use the existing structure as a template.

## 6. Test Everything

```bash
# Install dependencies
pnpm install

# Test package build
pnpm build:package

# Test web build
pnpm build:web

# Test development
pnpm dev
```

## 7. Remove Template Files

Once you're set up, you may want to remove:
- This `SETUP.md` file
- The `ai/` directory (if not needed)
- Any other template-specific files

## Next Steps

- Write your package code
- Create documentation
- Design your landing page
- Set up CI/CD
- Publish to npm!

