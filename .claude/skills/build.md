# Build

Build the MATE Token web app for production.

## Usage
Run from `/web` directory:
```bash
pnpm run build
```

Output goes to `/web/dist/` with:
- `dist/client/` - Static assets
- `dist/server/` - Server-side code (SSR)

## Preview Production Build
```bash
pnpm run preview
```

## Notes
- Uses `output: "server"` mode with Node adapter
- Pages with `export const prerender = true` are statically generated
- Pages with `export const prerender = false` are server-rendered
