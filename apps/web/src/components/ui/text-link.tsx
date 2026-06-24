import type { ButtonHTMLAttributes } from 'react';

export function TextLink({
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`text-sm font-medium text-primary-500 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50 ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
