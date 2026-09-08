/**
 * TEMPORARY placeholder for the official GadGexo logo (leaf-shaped "G" +
 * gradient wordmark, per the Master Context brand spec). No such asset
 * exists in this repository yet.
 *
 * When the real logo file (SVG preferred) is available:
 *   1. Add it to /public/brand/ (e.g. logo.svg)
 *   2. Replace the JSX below with an <Image> / inline <svg> using it
 *   3. Nothing that imports <LogoMark /> needs to change
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="text-foreground">Gad</span>
      <span className="text-gradient-gadgexo">Gexo</span>
    </span>
  );
}
