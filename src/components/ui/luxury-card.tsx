import React, { useRef, useState } from 'react';

interface LuxuryCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  variant?: 'gold' | 'emerald' | 'amber' | 'rose' | 'obsidian';
}

export const LuxuryCard: React.FC<LuxuryCardProps> = ({
  children,
  className = '',
  glowColor = 'rgba(245, 158, 11, 0.15)',
  variant = 'gold',
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const variantBorders = {
    gold: 'border-amber-500/20 hover:border-amber-500/40 shadow-[0_8px_30px_rgb(0,0,0,0.12)]',
    emerald: 'border-emerald-500/30 hover:border-emerald-500/50 shadow-[0_8px_30px_rgba(16,185,129,0.1)]',
    amber: 'border-amber-500/30 hover:border-amber-500/50 shadow-[0_8px_30px_rgba(245,158,11,0.1)]',
    rose: 'border-rose-500/30 hover:border-rose-500/50 shadow-[0_8px_30px_rgba(244,63,94,0.1)]',
    obsidian: 'border-neutral-800 hover:border-neutral-700 shadow-xl',
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: -1000, y: -1000 });
      }}
      className={`relative overflow-hidden rounded-3xl border bg-neutral-950/90 text-white backdrop-blur-xl transition-all duration-300 ${variantBorders[variant]} ${className}`}
    >
      {/* 21st.dev Cursor Spotlight Glow */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 70%)`,
        }}
      />

      {/* Content wrapper */}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};
