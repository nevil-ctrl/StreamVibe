import React from 'react';
import { Loader2 } from 'lucide-react';

export type LoadingButtonProps = React.ComponentPropsWithRef<'button'>;

export function LoadingButton({
  className = '',
  ...props
}: LoadingButtonProps) {
  return (
    <button
      disabled
      className={`flex items-center justify-center gap-2 opacity-70 cursor-not-allowed ${className}`}
      {...props}>
      <Loader2 className="w-5 h-5 animate-spin" />
      <span>Загрузка...</span>
    </button>
  );
}
