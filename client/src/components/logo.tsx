import React from "react";

export const Logo = () => (
  <svg
    width="120"
    height="50"
    viewBox="0 0 120 50"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Car body */}
    <path
      d="M10 25 H35 L45 15 H75 L85 25 H110"
      stroke="#1D4ED8"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Wheels */}
    <circle cx="30" cy="30" r="4" fill="#1D4ED8" />
    <circle cx="90" cy="30" r="4" fill="#1D4ED8" />

    {/* Text under wheels */}
    <text
      x="50%"
      y="45"
      fill="#1D4ED8"
      fontFamily="Arial, sans-serif"
      fontSize="10"
      fontWeight="bold"
      textAnchor="middle"
    >
      Auto Rent Ethiopia
    </text>
  </svg>
);
