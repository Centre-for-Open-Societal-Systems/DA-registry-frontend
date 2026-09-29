import Link from "next/link";

const CLASS = "inline-flex w-fit items-center gap-2.5 text-[15px] font-medium text-ink transition-colors hover:text-brand-green";

const ArrowLeft = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

type BackLinkProps = { label?: string } & ({ href: string; onClick?: never } | { onClick: () => void; href?: never });

/** The "← Back" affordance at the top of detail pages: a link when given `href`, a button when given `onClick`. */
export function BackLink({ label = "Back", ...target }: BackLinkProps) {
  if (target.href !== undefined) {
    return (
      <Link href={target.href} className={CLASS}>
        <ArrowLeft />
        {label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={target.onClick} className={CLASS}>
      <ArrowLeft />
      {label}
    </button>
  );
}
