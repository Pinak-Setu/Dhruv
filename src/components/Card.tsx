'use client';
import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
};

export default function Card({ children, className, as: Tag = 'div' }: CardProps) {
  return <Tag className={["card-soft", className || ''].join(' ').trim()}>{children}</Tag>;
}


