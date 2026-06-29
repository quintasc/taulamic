import Link from 'next/link';
import { IconChevronRight, IconLock } from '@/components/icons';
import type { MarketingCard } from '@/components/marketing/marketing-cards';

export function MarketingCard({
  card,
  adminHref,
}: {
  card: MarketingCard;
  adminHref: string;
}) {
  const comingSoon = card.availability === 'coming-soon';
  const featured = card.featured;

  return (
    <article
      aria-label={
        comingSoon
          ? `${card.title} — próximamente, aún no disponible en el piloto`
          : card.title
      }
      className={`relative flex flex-col rounded-[18px] p-7 md:p-8 ${
        featured
          ? 'bg-neutral-900 text-neutral-0 shadow-[0_8px_40px_rgba(0,0,0,0.2)]'
          : 'border border-neutral-200 bg-neutral-0 shadow-[0_2px_20px_rgba(0,0,0,0.06)]'
      } ${comingSoon ? 'opacity-[0.88]' : ''}`}
    >
      {featured ? (
        <span className="absolute right-[18px] top-[18px] rounded-full bg-primary-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-600">
          Disponible en piloto
        </span>
      ) : comingSoon ? (
        <span className="absolute right-[18px] top-[18px] inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-neutral-500">
          <IconLock width={10} height={10} aria-hidden />
          Próximamente
        </span>
      ) : null}
      <div
        className={`mb-5 flex h-[120px] items-center ${
          featured ? 'bg-neutral-900' : ''
        } ${comingSoon ? 'grayscale-[0.35]' : ''}`}
      >
        {card.illu}
      </div>
      <h3
        className={`text-[15px] font-bold tracking-wide ${
          featured ? 'text-neutral-0' : 'text-neutral-900'
        }`}
      >
        {card.title}
      </h3>
      <p
        className={`mt-2.5 flex-1 text-[13px] leading-[1.7] ${
          featured ? 'text-neutral-400' : 'text-neutral-500'
        }`}
      >
        {card.desc}
      </p>
      {comingSoon ? (
        <p className="mt-5 text-[13px] font-medium text-neutral-400">
          Segmento en roadmap — aún no operativo
        </p>
      ) : (
        <Link
          href={adminHref}
          className="mt-5 inline-flex items-center gap-1 text-[13px] font-medium text-primary-500 hover:text-primary-600"
        >
          Probar ahora <IconChevronRight width={13} height={13} />
        </Link>
      )}
    </article>
  );
}
