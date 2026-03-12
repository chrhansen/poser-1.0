interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  /** Compact vertical padding – use for authenticated / app pages */
  compact?: boolean;
}

export function Section({ children, className, id, compact }: SectionProps) {
  const pad = compact ? "py-6 md:py-8" : "py-16 md:py-24";
  return (
    <section id={id} className={`${pad} ${className ?? ""}`}>
      <div className="container">{children}</div>
    </section>
  );
}
