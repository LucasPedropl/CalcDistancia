import type { ReactNode } from 'react';

interface AdminPageContainerProps {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AdminPageContainer({
  title,
  description,
  actions,
  children,
}: AdminPageContainerProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-slate-100">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">{description}</p>
          </div>
          {actions}
        </div>

        {children}
      </div>
    </div>
  );
}
