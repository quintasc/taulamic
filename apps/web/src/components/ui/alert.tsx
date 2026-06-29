import { feedbackSurfaceClass, type FeedbackSurfaceVariant } from '@/lib/feedback-surface';

export function Alert({
  variant,
  children,
}: {
  variant: FeedbackSurfaceVariant;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl px-4 py-3 text-sm ${feedbackSurfaceClass[variant]}`}
      role="alert"
    >
      {children}
    </div>
  );
}
