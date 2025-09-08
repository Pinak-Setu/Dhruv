'use client';
import React from 'react';

type SoftButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
};

export default function SoftButton({ children, onClick, disabled, className, ariaLabel }: SoftButtonProps) {
  return (
    <button
      type="button"
      className={[
        'btn-soft',
        'text-sm',
        className || '',
      ].join(' ').trim()}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}


