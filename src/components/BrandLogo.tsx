"use client";

import React, { useId } from "react";

interface BrandLogoProps {
  className?: string;
  size?: number;
}

export function BrandLogo({ className = "w-5 h-5", size = 20 }: BrandLogoProps) {
  const rawId = useId();
  const safeId = rawId.replace(/[^a-zA-Z0-9]/g, "");
  const gradPrimary = `brand-p-${safeId}`;
  const gradAccent = `brand-a-${safeId}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient
          id={gradPrimary}
          x1="2"
          y1="2"
          x2="30"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient
          id={gradAccent}
          x1="16"
          y1="4"
          x2="16"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Hexagonal Outer Node Structure */}
      <path
        d="M16 3L28 9.5V22.5L16 29L4 22.5V9.5L16 3Z"
        stroke={`url(#${gradPrimary})`}
        strokeWidth="2.2"
        strokeLinejoin="round"
        fill={`url(#${gradPrimary})`}
        fillOpacity="0.2"
      />

      {/* Internal Neural Connections */}
      <path
        d="M16 3V16M28 9.5L16 16M28 22.5L16 16M16 29V16M4 22.5L16 16M4 9.5L16 16"
        stroke={`url(#${gradAccent})`}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Central Core Processor Node */}
      <circle cx="16" cy="16" r="3" fill="#ffffff" />
      <circle
        cx="16"
        cy="16"
        r="5.5"
        stroke="#818cf8"
        strokeWidth="1.2"
        strokeOpacity="0.8"
      />
    </svg>
  );
}
