// Chip.jsx
export default function Chip({ children, className = "" }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}
