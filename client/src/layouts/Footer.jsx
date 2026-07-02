import React, { useState } from 'react';

const Footer = () => {
  const [showMailPicker, setShowMailPicker] = useState(false);

  const recipient = 'support@gnosysdigital.com';
  const subject = 'Inquiry - Prospect Data Engine';

  const mailOptions = [
    {
      name: 'Gmail (Web)',
      desc: 'Open compose window directly in Google Mail',
      url: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}`,
      badge: 'bg-red-500 text-white',
      letter: 'G',
    },
    {
      name: 'Yahoo Mail (Web)',
      desc: 'Open compose window in Yahoo Mail',
      url: `https://compose.mail.yahoo.com/?to=${encodeURIComponent(recipient)}&subject=${encodeURIComponent(subject)}`,
      badge: 'bg-purple-600 text-white',
      letter: 'Y',
    },
    {
      name: 'Outlook Web (Live / O365)',
      desc: 'Open compose window in Microsoft Outlook Web',
      url: `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(recipient)}&subject=${encodeURIComponent(subject)}`,
      badge: 'bg-blue-600 text-white',
      letter: 'O',
    },
  ];

  const handleOpenProvider = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowMailPicker(false);
  };

  const handleSystemDefault = () => {
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}`;
    setShowMailPicker(false);
  };

  return (
    <footer className="w-full bg-zinc-900 text-zinc-300 border-t border-zinc-800/80 pt-16 pb-12 mt-auto select-none relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-14 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-14 border-b border-zinc-800/80">
          
          {/* Col 1: Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img src="/img.png" alt="PDE Logo" className="h-9 w-auto object-contain" />
              <span className="font-bold text-white text-lg tracking-tight">Prospect Data Engine</span>
            </div>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-sm font-normal">
              Enterprise-grade centralized database consolidation, rapid file deduplication scan, and accountable B2B campaign management node.
            </p>
          </div>

          {/* Col 2: Platform Links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400">
              // PLATFORM
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400">
              <li className="hover:text-white transition-colors cursor-pointer">
                Centralized DB Consolidation
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                Rapid File Dedup Engine
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                Regenerate History Filter
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                Target Campaign Lifecycle
              </li>
            </ul>
          </div>

          {/* Col 3: Compliance & Security */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400">
              // COMPLIANCE & SECURITY
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-zinc-400">
              <li className="hover:text-white transition-colors">
                Enterprise RBAC Access Control
              </li>
              <li className="hover:text-white transition-colors">
                Zero Duplicate Record Guarantee
              </li>
              <li className="hover:text-white transition-colors">
                High-Throughput Stream Processing
              </li>
            </ul>

            <div className="pt-3">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">// DIRECT SUPPORT</div>
              <button
                onClick={() => setShowMailPicker(true)}
                type="button"
                className="text-xs sm:text-sm text-indigo-400 hover:text-indigo-300 font-medium underline decoration-indigo-500/40 hover:decoration-indigo-300 transition-colors cursor-pointer text-left block"
              >
                Contact Us: {recipient}
              </button>
            </div>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-normal">
          <div>
            &copy; {new Date().getFullYear()} Prospect Data Engine. All rights reserved.
          </div>
          
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800/80 shadow-inner">
            <span>Precision Engineered by</span>
            <img src="/img.png" alt="Gnosys Digital" className="h-5 w-auto object-contain" />
            <span className="font-semibold text-zinc-200 tracking-wide">Gnosys Digital</span>
          </div>
        </div>

      </div>

      {/* Interactive Mail Provider Picker Modal */}
      {showMailPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-200 border border-gray-300/80 rounded-2xl p-6 max-w-md w-full shadow-2xl text-left space-y-5 text-gray-800">
            <div className="flex items-start justify-between border-b border-gray-300 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">Choose Your Mail Service</h3>
                </div>
                <p className="text-xs text-gray-600 pl-0.5">
                  Send email to <span className="text-indigo-700 font-mono font-semibold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/60">{recipient}</span>
                </p>
              </div>
              <button
                onClick={() => setShowMailPicker(false)}
                className="text-gray-500 hover:text-gray-800 text-lg font-bold w-8 h-8 flex items-center justify-center rounded-lg bg-gray-300/70 hover:bg-gray-300 transition-colors shadow-sm cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {mailOptions.map((opt) => (
                <button
                  key={opt.name}
                  onClick={() => handleOpenProvider(opt.url)}
                  className="w-full text-left p-3.5 rounded-xl bg-white hover:bg-indigo-50/70 border border-gray-300/80 hover:border-indigo-400 shadow-sm hover:shadow transition-all duration-200 group flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-105 ${opt.badge}`}>
                      {opt.letter}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{opt.name}</span>
                      <span className="text-xs text-gray-500">{opt.desc}</span>
                    </div>
                  </div>
                  <div className="text-gray-400 group-hover:text-indigo-600 transition-colors pr-1">
                    <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}

              <button
                onClick={handleSystemDefault}
                className="w-full text-left p-3.5 rounded-xl bg-gray-100 hover:bg-white border border-gray-300 hover:border-gray-400 shadow-sm transition-all duration-200 flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-gray-700 text-white flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-105">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800 group-hover:text-gray-950 transition-colors">Default System Mail Client</span>
                    <span className="text-xs text-gray-500">Use configured desktop app (Outlook, Apple Mail, etc.)</span>
                  </div>
                </div>
                <div className="text-gray-400 group-hover:text-gray-600 transition-colors pr-1">
                  <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>

            <div className="pt-3 border-t border-gray-300 flex justify-end">
              <button
                onClick={() => setShowMailPicker(false)}
                className="px-5 py-2 text-xs font-semibold text-gray-700 hover:text-gray-950 bg-gray-300 hover:bg-gray-400/70 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
