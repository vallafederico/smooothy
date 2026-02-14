# Embed Precog Markets

Embed prediction markets from Precog using iframes.

## Iframe Format
```html
<iframe
  src="https://embed.precog.market/market?network=8453&id=MARKET_ID&type=compact&theme=dark&source=chain"
  width="420"
  height="315"
  frameborder="0"
  allow="clipboard-write"
></iframe>
```

## Parameters
- `network` - Chain ID (8453 = Base)
- `id` - Market ID number
- `type` - `compact` or `full`
- `theme` - `dark` or `light`
- `source` - `chain`

## React Component
```tsx
function MarketEmbed({ marketId }: { marketId: number }) {
  const embedUrl = `https://embed.precog.market/market?network=8453&id=${marketId}&type=compact&theme=dark&source=chain`

  return (
    <div className="overflow-hidden rounded-lg">
      <iframe
        src={embedUrl}
        width="420"
        height="315"
        frameBorder="0"
        allow="clipboard-write"
        loading="lazy"
        className="block max-w-full"
      />
    </div>
  )
}
```

## Astro Component
See `/web/src/components/MarketEmbed.astro`

## Current Markets
- Market 39
- Market 40
- Market 41
