import React from 'react';

export interface ButtonProps extends React.ComponentPropsWithRef<'button'> {
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}>
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
