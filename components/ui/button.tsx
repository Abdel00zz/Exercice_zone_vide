import React from 'react';
import { cn } from '../../lib/utils';

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
type ButtonSize = 'sm' | 'default' | 'lg' | 'icon';

export const buttonVariants = ({ variant = 'default', size = 'default', className }: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) => cn(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    'bg-primary text-primary-foreground hover:bg-primary/90 shadow-none': variant === 'default',
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-none': variant === 'secondary',
    'border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-none': variant === 'outline',
    'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
    'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-none': variant === 'destructive',
    'text-primary underline-offset-4 hover:underline': variant === 'link',
    'h-9 rounded-none px-3': size === 'sm',
    'h-10 px-4 py-2': size === 'default',
    'h-11 rounded-none px-8': size === 'lg',
    'h-10 w-10': size === 'icon',
  },
  className,
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button ref={ref} type={type} className={buttonVariants({ variant, size, className })} {...props} />
  ),
);
Button.displayName = 'Button';
