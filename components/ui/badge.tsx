import React from 'react';
import { cn } from '../../lib/utils';

export const Badge: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className, ...props }) => (
  <span className={cn('inline-flex items-center rounded-md border border-border px-2.5 py-0.5 text-xs font-semibold transition-colors', className)} {...props} />
);
