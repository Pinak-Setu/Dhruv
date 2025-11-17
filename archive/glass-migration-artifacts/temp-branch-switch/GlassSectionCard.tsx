import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassSectionCardProps {
  children: ReactNode;
  className?: string;
}

export default function GlassSectionCard({ children, className }: GlassSectionCardProps) {
  return (
    <div
      className={cn(
        "glass-section-card p-4 transition-all duration-500 ease-in-out",
        className
      )}
    >
      {children}
    </div>
  );
}