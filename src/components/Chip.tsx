'use client';
import React from 'react';

type ChipProps = {
  label: string;
  selected?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

export default function Chip({ label, selected, icon, onClick, className }: ChipProps) {
  return (
    <button
      type="button"
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-sm',
        'rounded-full border',
        selected ? 'bg-blue-100 text-blue-900 border-blue-200' : 'bg-slate-100 text-slate-900 border-gray-200',
        className || '',
      ].join(' ').trim()}
      onClick={onClick}
      aria-pressed={selected}
    >
      {icon ? <span aria-hidden>{icon}</span> : null}
      <span>{label}</span>
    </button>
  );
}


