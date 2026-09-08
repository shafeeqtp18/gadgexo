# Official GadGexo logo — not yet added

Per the Master Context (leaf-shaped "G" icon, "Gad" in white + "Gexo" in a
purple → blue → cyan gradient), the real logo asset should live here.

Until it's supplied, the app uses a text-only placeholder at
`components/brand/logo-mark.tsx`. Once you have the real file:

1. Add it here, e.g. `logo.svg` (SVG preferred — scales cleanly, small file size).
2. Update `components/brand/logo-mark.tsx` to render it.
3. Nothing else needs to change — every place using `<LogoMark />` picks it up automatically.
