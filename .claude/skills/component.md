# Create Component

Create a new component for the MATE Token web app.

## Component Types

### React Component (.tsx)
Location: `/web/src/components/`

```tsx
import { useState } from "react"

interface Props {
  // props here
}

export default function ComponentName({ }: Props) {
  return (
    <div className="">
      {/* content */}
    </div>
  )
}
```

Use in Astro with `client:load` or `client:only="react"` directive.

### Astro Component (.astro)
Location: `/web/src/components/`

```astro
---
interface Props {
  // props here
}

const { } = Astro.props
---

<div class="">
  <!-- content -->
</div>

<style>
  /* scoped styles */
</style>
```

## Conventions
- Use Tailwind CSS for styling
- React components for interactive/stateful UI
- Astro components for static content
- Place landing page components in `/web/src/components/landing/`
- Place 3D components in `/web/src/components/three/`
