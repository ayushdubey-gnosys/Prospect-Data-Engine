import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-slate-200 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-sm text-slate-500">
        <p className="mb-2">&copy; {new Date().getFullYear()} Prospect Data Engine. All rights reserved.</p>
        <p className="font-medium tracking-wide mb-2">Developed by</p>
        <div className="flex items-center gap-2">
          <img src="/img.png" alt="Gnosys Digital Logo" className="h-6 w-auto opacity-80" />
          <span className="text-sm font-semibold text-gray-600">Gnosys Digital</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
