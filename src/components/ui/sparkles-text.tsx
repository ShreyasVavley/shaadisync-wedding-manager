import React, { useEffect, useState } from 'react';

interface Sparkle {
  id: string;
  x: string;
  y: string;
  color: string;
  delay: number;
  scale: number;
  lifespan: number;
}

interface SparklesTextProps {
  text: string;
  className?: string;
  sparklesCount?: number;
  colors?: { first: string; second: string };
}

const Star: React.FC<{ color: string; scale: number }> = ({ color, scale }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="animate-spin-slow pointer-events-none absolute"
    style={{
      width: `${16 * scale}px`,
      height: `${16 * scale}px`,
      filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.8))',
    }}
  >
    <path
      d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"
      fill={color}
    />
  </svg>
);

export const SparklesText: React.FC<SparklesTextProps> = ({
  text,
  className = '',
  sparklesCount = 5,
  colors = { first: '#fbbf24', second: '#f59e0b' },
}) => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    const generateSparkles = () => {
      const newSparkles: Sparkle[] = [];
      for (let i = 0; i < sparklesCount; i++) {
        newSparkles.push({
          id: `${i}-${Date.now()}`,
          x: `${Math.random() * 100}%`,
          y: `${Math.random() * 100}%`,
          color: Math.random() > 0.5 ? colors.first : colors.second,
          delay: Math.random() * 2,
          scale: Math.random() * 0.7 + 0.5,
          lifespan: Math.random() * 1.5 + 1.5,
        });
      }
      setSparkles(newSparkles);
    };

    generateSparkles();
    const interval = setInterval(generateSparkles, 2500);
    return () => clearInterval(interval);
  }, [sparklesCount, colors.first, colors.second]);

  return (
    <span className={`relative inline-block ${className}`}>
      {sparkles.map((sparkle) => (
        <span
          key={sparkle.id}
          className="pointer-events-none absolute"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            animation: `sparkle-fade ${sparkle.lifespan}s ease-in-out infinite`,
            animationDelay: `${sparkle.delay}s`,
          }}
        >
          <Star color={sparkle.color} scale={sparkle.scale} />
        </span>
      ))}
      <span className="relative z-10">{text}</span>
    </span>
  );
};
