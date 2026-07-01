// Brin végétal — motif signature du débrief. Pur SVG, sans état.
export function Sprig({ color, w = 46 }: { color: string; w?: number }) {
  return (
    <svg width={w} height="14" viewBox="0 0 46 14" fill="none" aria-hidden="true">
      <path d="M1 7h44" stroke={color} strokeWidth="1" />
      <path
        d="M23 7c0-3 2-5 5-6M23 7c0 3 2 5 5 6M23 7c0-3-2-5-5-6M23 7c0 3-2 5-5 6"
        stroke={color}
        strokeWidth="1"
        fill="none"
        opacity="0.8"
      />
      <circle cx="23" cy="7" r="1.6" fill={color} />
    </svg>
  );
}
