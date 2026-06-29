export type FeedbackSurfaceVariant = 'success' | 'warning' | 'error' | 'info';

export const feedbackSurfaceClass: Record<FeedbackSurfaceVariant, string> = {
  success: 'feedback-surface-success',
  warning: 'feedback-surface-warning',
  error: 'feedback-surface-error',
  info: 'feedback-surface-info',
};
