# Create Page

Create a new page/route for the MATE Token web app.

## Location
Pages go in `/web/src/pages/`

## Static Page (Prerendered)
```astro
---
export const prerender = true

import Layout from "~/layouts/Layout.astro"
---

<Layout>
  <div class="min-h-screen px-4 py-24">
    <!-- page content -->
  </div>
</Layout>
```

## Dynamic Page (Server-rendered)
```astro
---
export const prerender = false

import Layout from "~/layouts/Layout.astro"

// Access request data
const { url, params } = Astro
---

<Layout>
  <div class="min-h-screen px-4 py-24">
    <!-- page content -->
  </div>
</Layout>
```

## API Route
Location: `/web/src/pages/api/`

```ts
import type { APIRoute } from "astro"

export const GET: APIRoute = async ({ request, url }) => {
  return new Response(JSON.stringify({ data: "value" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json()
  // handle request
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
```

## Path Aliases
- `~/` → `/web/src/`
- `@c/` → `/web/src/components/`
- `@svg/` → `/web/src/components/svg/`
