
import React from 'react';
import CollegeLogo from './CollegeLogo';

const CollegeBanner = () => {
  return (
    <div className="w-full h-32 relative overflow-hidden">
      <img 
        src="/lovable-uploads/c0bce286-45d3-4566-9548-df5eb194b99e.png" 
        alt="College Campus" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-collegeBlue-500/80"></div>
      <CollegeLogo />
    </div>
  );
};

export default CollegeBanner;
