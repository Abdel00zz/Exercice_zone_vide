import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

interface DropdownMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'start' | 'end';
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ open, onOpenChange, trigger, children, align = 'end' }) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onOpenChange(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={rootRef} className="relative inline-flex" onClick={(event) => event.stopPropagation()}>
      {trigger}
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute top-full z-40 mt-2 min-w-44 overflow-hidden rounded-none border border-border bg-card p-1.5 text-card-foreground shadow-lg',
            align === 'end' ? 'right-0' : 'left-0',
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownMenuItem: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, ...props }) => (
  <button
    type="button"
    role="menuitem"
    className={cn('flex w-full items-center gap-2 rounded-none px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', className)}
    {...props}
  />
);
