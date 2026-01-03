# Package Starter Template

A modern starter template for creating npm packages with beautiful Astro documentation and landing pages.

## 🚀 Features

- **Package Development**: Clean TypeScript package structure with build scripts
- **Documentation Site**: Astro-powered documentation and landing page
- **Build System**: Bun-based build system with ESM, CJS, and UMD outputs
- **TypeScript**: Full TypeScript support with type definitions
- **Monorepo**: pnpm workspace setup for managing package and web app together

## 📁 Project Structure

```
.
├── package/          # Your npm package source code
│   ├── src/         # Source files
│   ├── index.ts     # Package entry point
│   └── package.json # Package configuration
├── web/             # Astro documentation site
│   ├── src/         # Astro source files
│   └── public/      # Static assets
├── bin/             # Build scripts
└── docs/            # Documentation files
```

## 🛠️ Getting Started

### 1. Update Package Information

**Easy way (recommended):** Update `package.config.json` with your package details, then run:

```bash
pnpm sync
```

This will automatically sync common fields (name, version, author, description, repository, etc.) across all `package.json` files.

**Manual way:** Update the following files individually:

- `package.json` - Package name, description, repository, etc.
- `package/package.json` - Package-specific configuration
- `web/package.json` - Web app configuration
- `bin/build.ts` - Update global name and bundle name
- `web/astro.config.mjs` - Update site URL

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Develop

Run both package and web app in development mode:

```bash
pnpm dev
```

Or run them separately:

```bash
pnpm dev:package  # Watch package files
pnpm dev:web      # Start Astro dev server
```

### 4. Build

Build both package and web app:

```bash
pnpm build
```

Or build separately:

```bash
pnpm build:package  # Build package
pnpm build:web      # Build Astro site
```

### 5. Publish

When ready to publish your package:

```bash
pnpm release:patch   # Patch version (0.0.1 -> 0.0.2)
pnpm release:minor   # Minor version (0.0.1 -> 0.1.0)
pnpm release:major   # Major version (0.0.1 -> 1.0.0)
```

## 📦 Package Development

### Package Structure

Your package code lives in the `package/` directory:

- `package/src/core.ts` - Main package implementation
- `package/src/utils.ts` - Utility functions
- `package/index.ts` - Package exports

### Build Outputs

The build process generates:

- `dist/esm.js` - ES Module format
- `dist/cjs.js` - CommonJS format
- `dist/package.min.js` - UMD bundle for browsers
- `dist/index.d.ts` - TypeScript definitions

### Customizing the Build

Edit `bin/build.ts` to customize the build process. Update the global name and bundle name for browser builds:

```typescript
globalName: "YourPackageName",
naming: "your-package.min.js",
```

## 🌐 Documentation Site

The `web/` directory contains an Astro site for your documentation and landing page.

### Customizing the Landing Page

Edit `web/src/pages/index.astro` and `web/src/components/landing/Hero.astro` to customize your landing page.

### Adding Documentation Pages

Create new pages in `web/src/pages/`:

```astro
---
import Layout from "~/layouts/Layout.astro"
---

<Layout>
  <h1>Documentation Page</h1>
  <!-- Your content here -->
</Layout>
```

### Styling

The site uses Tailwind CSS. Customize styles in `web/src/styles/` or add Tailwind classes directly.

## 📝 Documentation

Add your documentation files to the `docs/` directory. You can reference them in your Astro pages or link to them from your landing page.

## 🔧 Configuration

### Syncing Package Metadata

To keep all `package.json` files in sync, update `package.config.json` with your package information and run:

```bash
pnpm sync
```

This syncs the following fields across all package.json files:

- `name` - Package name
- `version` - Package version
- `author` - Author information
- `description` - Package description
- `license` - License type
- `repository` - Git repository URL
- `bugs` - Bug tracker URL
- `homepage` - Homepage URL
- `keywords` - Package keywords

### TypeScript

- Root `tsconfig.json` - TypeScript configuration for the package
- `web/tsconfig.json` - TypeScript configuration for the Astro site

### Package Manager

This template uses `pnpm` with workspaces. The `pnpm-workspace.yaml` defines the workspace structure.

## 📄 License

MIT

## 🤝 Contributing

This is a starter template. Fork it, customize it, and make it your own!

---

**Happy coding!** 🎉
