/** Official PORTOFINO marks (vectorised from the supplied artwork), rendered as masks in currentColor. */
type P = { className?: string; label?: string };
export const Monogram = ({ className = "", label }: P) => <span role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={`mark mark-monogram ${className}`} />;
export const Dept = ({ className = "", label }: P) => <span role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={`mark mark-dept ${className}`} />;
export const Lockup = ({ className = "", label }: P) => <span role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={`mark mark-lockup ${className}`} />;
