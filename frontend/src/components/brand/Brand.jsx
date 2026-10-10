// Original TC monogram: an open archive arch, a central T and a wine registration mark.
export function CampusSymbol({ className = "brand-symbol" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 56"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M39 17C39 8 33 4 24 4S8 11 8 22v24h31"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M15 21h19M24.5 21v24M15 49h24"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M32 7h10v10" stroke="var(--accent, #682c40)" strokeWidth="2" />
    </svg>
  );
}
export default function Brand() {
  return (
    <div className="brand" aria-label="Takion Campus, by Takion Software">
      <CampusSymbol />
      <div className="brand-text">
        <strong>
          Takion <span>Campus</span>
        </strong>
        <small>by Takion Software</small>
      </div>
    </div>
  );
}
