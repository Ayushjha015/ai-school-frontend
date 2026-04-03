interface DotPatternProps {
  className?: string;
  dotColor?: string;
  dotSize?: number;
  gap?: number;
}

export function DotPattern({ className = '', dotColor = 'currentColor', dotSize = 1.25, gap = 22 }: DotPatternProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage: `radial-gradient(circle, ${dotColor} ${dotSize}px, transparent ${dotSize + 0.15}px)`,
        backgroundSize: `${gap}px ${gap}px`,
      }}
    />
  );
}
