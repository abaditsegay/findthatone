import React from 'react';
import './Logo.css';

const Logo = ({ size = 'medium', variant = 'full', className = '', onClick }) => {
  const sizes = {
    tiny: { width: 80, height: 32 },
    small: { width: 120, height: 40 },
    medium: { width: 160, height: 50 },
    large: { width: 200, height: 60 },
    xlarge: { width: 240, height: 80 }
  };

  const logoSize = sizes[size];

  if (variant === 'icon') {
    const iconSize = size === 'large' ? 48 : size === 'medium' ? 40 : 32;
    return (
      <div 
        className={`logo-container logo-icon ${className}`}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={`heartGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:'#ff6b6b', stopOpacity:1}} />
              <stop offset="50%" style={{stopColor:'#ee5a52', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#ff8a80', stopOpacity:1}} />
            </linearGradient>
            <radialGradient id={`bgGradient-${size}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{stopColor:'#ffffff', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#f8f9fa', stopOpacity:1}} />
            </radialGradient>
          </defs>
          
          <circle cx="16" cy="16" r="15" fill={`url(#bgGradient-${size})`} stroke="#667eea" strokeWidth="1"/>
          
          <g transform="translate(16, 16)">
            <path d="M0 6c-3-6-9-6-9-1.5C-9 10 0 13 0 13s9-3 9-8.5c0-4.5-6-4.5-9 1.5z" 
                  fill={`url(#heartGradient-${size})`} 
                  stroke="#fff" 
                  strokeWidth="0.5"/>
            <circle cx="6" cy="-2" r="0.8" fill="#ffd700" opacity="0.9"/>
            <circle cx="-6" cy="0" r="0.5" fill="#ffd700" opacity="0.7"/>
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div 
      className={`logo-container logo-full ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <svg width={logoSize.width} height={logoSize.height} viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`heartGradient-${size}-full`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:'#ff6b6b', stopOpacity:1}} />
            <stop offset="50%" style={{stopColor:'#ee5a52', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#ff8a80', stopOpacity:1}} />
          </linearGradient>
          <linearGradient id={`textGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{stopColor:'#667eea', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#764ba2', stopOpacity:1}} />
          </linearGradient>
        </defs>
        
        <g transform="translate(10, 15)">
          <path d="M15 25c-5-10-15-10-15-2.5C0 30 15 35 15 35s15-5 15-12.5c0-7.5-10-7.5-15 2.5z" 
                fill={`url(#heartGradient-${size}-full)`} 
                stroke="#fff" 
                strokeWidth="1"/>
          <circle cx="25" cy="10" r="1.5" fill="#ffd700" opacity="0.8"/>
          <circle cx="5" cy="12" r="1" fill="#ffd700" opacity="0.6"/>
        </g>
        
        <text x="45" y="25" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill={`url(#textGradient-${size})`}>Find</text>
        <text x="45" y="42" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="500" fill="#666">The</text>
        <text x="75" y="42" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill={`url(#textGradient-${size})`}>One</text>
        
        <path d="M130 20 Q140 15 150 20 Q160 25 170 20" stroke={`url(#heartGradient-${size}-full)`} strokeWidth="2" fill="none" opacity="0.7"/>
      </svg>
    </div>
  );
};

export default Logo;
