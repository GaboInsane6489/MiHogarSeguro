import React from "react";

interface BrandLogoProps {
  className?: string;
  size?: number;
}

export function BrandLogo({ className = "w-5 h-5", size = 20 }: BrandLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="brand-grad-primary" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="brand-grad-accent" x1="16" y1="4" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#a5b4fc" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Hexagonal Outer Node Structure */}
      <path
        d="M16 3L28 9.5V22.5L16 29L4 22.5V9.5L16 3Z"
        stroke="url(#brand-grad-primary)"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="url(#brand-grad-primary)"
        fillOpacity="0.12"
      />

      {/* Internal Neural / Geometric Connections */}
      <path
        d="M16 3V16M28 9.5L16 16M28 22.5L16 16M16 29V16M4 22.5L16 16M4 9.5L16 16"
        stroke="url(#brand-grad-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.7"
      />

      {/* Central Core Processor Node */}
      <circle cx="16" cy="16" r="3" fill="#ffffff" fillOpacity="0.95" />
      <circle cx="16" cy="16" r="5" stroke="url(#brand-grad-primary)" strokeWidth="1" strokeOpacity="0.6" />
    </svg>
  );
}
