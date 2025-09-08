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
        'chip',
        selected ? 'chip--active' : '',
        'text-sm',
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


