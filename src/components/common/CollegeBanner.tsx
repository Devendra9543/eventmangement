
import React from 'react';

const CollegeBanner = () => {
  return (
    <div className="relative h-12 overflow-hidden gradient-bg shadow-md">
      <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzBoLTZhNi4wNSA2LjA1IDAgMCAwLTYgNi4wNXYxMi45QTYuMDUgNi4wNSAwIDAgMCAzMCA1NWg2YTYuMDUgNi4wNSAwIDAgMCA2LTYuMDV2LTEyLjlBNi4wNSA2LjA1IDAgMCAwIDM2IDMweiIvPjxwYXRoIGQ9Ik0zMCAyNGg2YTYuMDUgNi4wNSAwIDAgMCA2LTYuMDVWNS4wNUE2LjA1IDYuMDUgMCAwIDAgMzYtMWgtNmE2LjA1IDYuMDUgMCAwIDAtNiA2LjA1djEyLjlBNi4wNSA2LjA1IDAgMCAwIDMwIDI0eiIvPjwvZz48L2c+PC9zdmc+')]"></div>
      <div className="container mx-auto flex justify-center items-center h-full">
        <h1 className="text-sm font-semibold text-white tracking-wider uppercase">Campus Connect</h1>
      </div>
    </div>
  );
};

export default CollegeBanner;
