import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

export interface BackgroundPatternProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "dots" | "grid" | "mesh";
  spotlight?: boolean;
  spotlightSize?: number;
  className?: string;
  children?: React.ReactNode;
}

export const BackgroundPattern: React.FC<BackgroundPatternProps> = ({
  variant = "dots",
  spotlight = true,
  spotlightSize = 350,
  className,
  children,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!spotlight) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseenter", () => setIsHovered(true));
      container.addEventListener("mouseleave", () => setIsHovered(false));
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseenter", () => setIsHovered(true));
        container.removeEventListener("mouseleave", () => setIsHovered(false));
      }
    };
  }, [spotlight]);

  return (
    <div
      ref={containerRef}
      className={cn("relative isolate overflow-hidden bg-[#fafafa]", className)}
      {...props}
    >
      {/* Background SVG Grid / Pattern Layer */}
      <div className="absolute inset-0 -z-20 pointer-events-none opacity-40">
        {variant === "dots" && (
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="dot-pattern"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
                patternContentUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1.2" fill="#94a3b8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-pattern)" />
          </svg>
        )}

        {variant === "grid" && (
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid-pattern"
                width="32"
                height="32"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 32 0 L 0 0 0 32"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="0.8"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        )}
      </div>

      {/* Cursor Spotlight Glow (21st.dev style) */}
      {spotlight && isHovered && (
        <div
          className="absolute -z-10 pointer-events-none rounded-full transition-opacity duration-300"
          style={{
            width: `${spotlightSize}px`,
            height: `${spotlightSize}px`,
            left: `${mousePos.x - spotlightSize / 2}px`,
            top: `${mousePos.y - spotlightSize / 2}px`,
            background:
              "radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, rgba(244, 63, 94, 0.03) 40%, transparent 70%)",
          }}
        />
      )}

      {/* Subtle luxury ambient gradient orbs */}
      <div className="absolute top-0 right-1/4 -z-20 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 -z-20 w-80 h-80 bg-rose-50/40 rounded-full blur-3xl pointer-events-none" />

      {children}
    </div>
  );
};
