// Standard Equal Housing Lender symbol, drawn inline so no third-party image is needed.
export function EqualHousingLenderLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label="Equal Housing Lender"
      className={className}
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M50 4 96 40H86v54H14V40H4ZM50 22 72 40v38H28V40Z"
      />
      <rect x="36" y="46" width="28" height="8" />
      <rect x="36" y="60" width="28" height="8" />
    </svg>
  );
}
