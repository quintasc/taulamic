import Link from 'next/link';
import { IconLock } from '@/components/icons';
import { Alert, PageHeader } from '@/components/ui';
import { PILOT_INVITATION_DESIGN_LOCKED_HINT } from '@/lib/pilot-features';
import { adminRoutes } from '@/lib/routes';

type PageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function InvitationDesignPage({ params }: PageProps) {
  const { eventId } = await params;
  const routes = adminRoutes(eventId);

  return (
    <>
      <PageHeader
        title="Tarjetas"
        subtitle="Paso 3 del setup: diseño y envío de tarjetas de invitación — disponible tras el piloto."
      />

      <Alert variant="info">
        <span className="inline-flex items-center gap-2">
          <IconLock width={16} height={16} className="shrink-0" />
          {PILOT_INVITATION_DESIGN_LOCKED_HINT}
        </span>
      </Alert>

      <p className="mt-6 text-sm text-neutral-600">
        <Link href={routes.dashboard} className="font-medium text-primary-600">
          Volver al dashboard
        </Link>
      </p>
    </>
  );
}
