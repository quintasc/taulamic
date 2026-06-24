import { redirect } from 'next/navigation';

type PageProps = {
  params: Promise<{ eventId: string }>;
};

/** Ruta legacy — redirige al panel Invitados canonico. */
export default async function GuestsV2RedirectPage({ params }: PageProps) {
  const { eventId } = await params;
  redirect(`/admin/events/${eventId}/guests`);
}
