/* eslint-disable jsx-a11y/role-supports-aria-props */
'use client';

import { ReactNode } from 'react';

export function AdminMobileCardShell({
  id,
  ariaLabel,
  ariaExpanded,
  onBlur,
  checkbox,
  actionsBefore,
  middleContent,
  actionsAfter,
  children,
}: {
  id?: string;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
  checkbox?: ReactNode;
  actionsBefore?: ReactNode;
  middleContent: ReactNode;
  actionsAfter?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <article
      id={id}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      onBlur={onBlur}
      className="card-admin overflow-hidden p-0"
    >
      <div className="flex items-center gap-2 p-2.5">
        {checkbox ? (
          <div className="shrink-0 flex items-center">
            {checkbox}
          </div>
        ) : null}

        {actionsBefore ? (
          <div className="shrink-0 flex items-center">
            {actionsBefore}
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          {middleContent}
        </div>

        {actionsAfter ? (
          <div className="flex shrink-0 items-center gap-1">
            {actionsAfter}
          </div>
        ) : null}
      </div>

      {children}
    </article>
  );
}
