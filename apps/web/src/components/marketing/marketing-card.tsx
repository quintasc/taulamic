import Link from 'next/link';
import { IconChevronRight } from '@/components/icons';
import type { MarketingCard } from '@/components/marketing/marketing-cards';

export function MarketingCard({
  card,
  adminHref,
}: {
  card: MarketingCard;
  adminHref: string;
}) {
  return (
    <article
      className={`relative flex flex-col rounded-[18px] p-7 md:p-8 ${
        card.featured
          ? 'bg-neutral-900 text-neutral-0 shadow-[0_8px_40px_rgba(0,0,0,0.2)]'
          : 'border border-neutral-200 bg-neutral-0 shadow-[0_2px_20px_rgba(0,0,0,0.06)]'
      }`}
    >
      {card.featured ? (
        <span className="absolute right-[18px] top-[18px] rounded-full bg-primary-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-600">
          Destacado
        </span>
      ) : null}
      <div
        className={`mb-5 flex h-[120px] items-center ${
          card.featured ? 'bg-neutral-900' : ''
        }`}
      >
        {card.illu}
      </div>
      <h3
        className={`text-[15px] font-bold tracking-wide ${
          card.featured ? 'text-neutral-0' : 'text-neutral-900'
        }`}
      >
        {card.title}
      </h3>
      <p className="mt-2.5 flex-1 text-[13px] leading-[1.7] text-neutral-500">
        {card.desc}
      </p>
      <Link
        href={adminHref}
        className="mt-5 inline-flex items-center gap-1 text-[13px] font-medium text-primary-500"
      >
        Saber más <IconChevronRight width={13} height={13} />
      </Link>
    </article>
  );
}
