import React from 'react';

const NovaLogo = ({ className = "w-8 h-8" }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    style={{ overflow: 'visible' }}
  >
    <defs>
      <linearGradient id="novaGradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#8B5CF6" /> {/* Indigo / Purple */}
        <stop offset="100%" stopColor="#06B6D4" /> {/* Cyan */}
      </linearGradient>
    </defs>
    
    {/* Base Chat Bubble */}
    <path 
      d="M20 5 
         H 75 
         C 88.8 5 100 16.2 100 30 
         V 65 
         C 100 78.8 88.8 90 75 90 
         H 35 
         L 5 100 
         V 80 
         C 1.8 75.5 0 70.2 0 65 
         V 25 
         C 0 13.9 8.9 5 20 5 Z"
      fill="url(#novaGradient)" 
    />

    {/* Connection Lines (Dark Slate) */}
    {/* Node 3 (Top-Middle) -> Node 1 (Center-Left) */}
    <line x1="55" y1="27" x2="30" y2="40" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
    {/* Node 1 (Center-Left) -> White Node (Center-Right) */}
    <line x1="30" y1="40" x2="65" y2="55" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
    {/* Node 2 (Bottom-Left) -> White Node (Center-Right) */}
    <line x1="30" y1="65" x2="65" y2="55" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
    {/* Node 4 (Top-Right) -> White Node (Center-Right) */}
    <line x1="80" y1="27" x2="65" y2="55" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />

    {/* Nodes */}
    {/* Node 1: Center Left */}
    <circle cx="30" cy="40" r="8" fill="#1E293B" />
    {/* Node 2: Bottom Left */}
    <circle cx="30" cy="65" r="7.5" fill="#1E293B" />
    {/* Node 3: Top Middle */}
    <circle cx="55" cy="27" r="7.5" fill="#1E293B" />
    {/* Node 4: Top Right */}
    <circle cx="80" cy="27" r="7.5" fill="#1E293B" />
    
    {/* Center Catalyst Node (White) */}
    <circle cx="65" cy="55" r="11" fill="#FFFFFF" />
  </svg>
);

export default NovaLogo;
