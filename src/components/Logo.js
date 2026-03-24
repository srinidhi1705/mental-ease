import React from 'react';

const Logo = ({ className = "h-8 w-8", alt = "MentalEase Logo" }) => {
  return (
    <img 
      src="/logo.gif" 
      alt={alt}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
};

export default Logo;