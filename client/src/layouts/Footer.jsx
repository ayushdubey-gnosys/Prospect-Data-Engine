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
    },
    {
      name: 'TD Webmail (Roundcube)',
      desc: 'Open Gnosys Digital enterprise webmail',
      url: `https://mail.gnosysdigital.com/?_task=mail&_action=compose&_to=${encodeURIComponent(recipient)}&_subject=${encodeURIComponent(subject)}`,
    },
    {
      name: 'Yahoo Mail (Web)',
      desc: 'Open compose window in Yahoo Mail',
      url: `https://compose.mail.yahoo.com/?to=${encodeURIComponent(recipient)}&subject=${encodeURIComponent(subject)}`,
    },
    {
      name: 'Outlook Web (Live / O365)',
      desc: 'Open compose window in Microsoft Outlook Web',
      url: `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(recipient)}&subject=${encodeURIComponent(subject)}`,
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl p-6 max-w-md w-full shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-white">Choose Your Mail Service</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Send email to <span className="text-indigo-400 font-mono">{recipient}</span></p>
              </div>
              <button
                onClick={() => setShowMailPicker(false)}
                className="text-zinc-400 hover:text-white text-lg font-bold px-2.5 py-1 rounded-lg bg-zinc-800/60 hover:bg-zinc-800"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {mailOptions.map((opt) => (
                <button
                  key={opt.name}
                  onClick={() => handleOpenProvider(opt.url)}
                  className="w-full text-left p-3 rounded-xl bg-zinc-800/50 hover:bg-indigo-600/20 border border-zinc-700/60 hover:border-indigo-500 transition-all group flex flex-col gap-0.5"
                >
                  <span className="text-sm font-semibold text-zinc-200 group-hover:text-indigo-300">{opt.name}</span>
                  <span className="text-xs text-zinc-400">{opt.desc}</span>
                </button>
              ))}

              <button
                onClick={handleSystemDefault}
                className="w-full text-left p-3 rounded-xl bg-zinc-800/30 hover:bg-zinc-800 border border-zinc-700/40 hover:border-zinc-600 transition-all flex flex-col gap-0.5"
              >
                <span className="text-sm font-semibold text-zinc-300">Default System Mail Client</span>
                <span className="text-xs text-zinc-500">Use configured desktop app (Outlook, Apple Mail, etc.)</span>
              </button>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex justify-end">
              <button
                onClick={() => setShowMailPicker(false)}
                className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800 rounded-xl transition-colors"
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
