import React from 'react';

export type InputProps = React.ComponentPropsWithRef<'input'>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={`w-full outline-none transition-all px-4 ${className}`}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
