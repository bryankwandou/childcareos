export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand" aria-label="ChildcareOS">
      <svg className="brand-icon" viewBox="0 0 48 48" role="img" aria-hidden="true">
        <path d="M11 27V17.5C11 10.6 16.4 5 23 5s12 5.6 12 12.5V27" />
        <path d="M24 34v-7.5C24 21.8 27.6 18 32 18s8 3.8 8 8.5V34" />
        <path className="brand-shield" d="M24 23.5c2.2-2.3 5-3.5 8-3.5s5.8 1.2 8 3.5v8.3c0 5.7-3.4 9.4-8 11.2-4.6-1.8-8-5.5-8-11.2v-8.3Z" />
      </svg>
      {!compact && <span>ChildcareOS</span>}
    </span>
  );
}
