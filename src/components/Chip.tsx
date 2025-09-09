'use client';
import React from 'react';

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  selected?: boolean;
  className?: string;
}

export default function Chip({ label, selected = false, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={[
        'chip',
        selected ? 'chip--active' : '',
        'text-sm',
        className || '',
      ].join(' ').trim()}
      {...props}
    >
      <span>{label}</span>
    </button>
  );
}


