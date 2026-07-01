import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Database, Search, Shield, Zap, ArrowRight, BarChart3, Layers, Video, 
  FileDown, Cpu, CheckCircle2, Filter, Tag, Users, Activity, RefreshCw, 
  Server, Sparkles, Building2, Briefcase, FileSpreadsheet, Workflow, 
  Target, Mail, Phone, Calendar, History, Sliders, CheckSquare, Edit3, 
  PlusCircle, RotateCcw, Share2, Eye, ChevronRight, ShieldCheck, Check, UploadCloud, XCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Footer from '../layouts/Footer';
import heroVideo from '../assets/PDE 01 .mp4';
import heroBgImage from '../assets/offfice.jpg';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleAuthRedirect = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const platformPillars = [
    {
      id: 'ingestion',
      label: 'Multi-User Central Ingestion',
      title: 'Consolidated Uploads & High-Speed File Scan Dedup',
      icon: UploadCloud,
      badge: 'MULTI-USER HUB',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      description: 'When multiple reps work across different territories, isolated Excel spreadsheets create chaos. PDE allows multiple operators to upload their files into one consolidated central database with rapid scanning.',
      points: [
        'Supports simultaneous file uploads from 2 or more users into a single centralized DB',
        'Interactive column mapping UI template engine for Excel, CSV & Google Sheets',
        'Rapid Full-File Scan: When any sheet is uploaded, the entire file is rapidly scanned in memory',
        'Internal & External Dedup: Automatically removes duplicate records within the uploaded file itself AND filters out entries already existing in the DB',
        'Ensures 100% unique data resides in the central repository without manual cleanup'
      ]
    },
    {
      id: 'export_regen',
      label: 'History & Filter Regeneration',
      title: 'Activity Telemetry & One-Click Filter Query Regeneration',
      icon: History,
      badge: 'AUDIT TRAIL',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      description: 'Maintain complete data governance. PDE records comprehensive historical logs of every file import and data export activity, tracking operator identity, exact dates, and specific filter parameters.',
      points: [
        'Complete upload and download telemetry tracking exact operator IDs (uploadedBy)',
        'Records exact filter configurations applied whenever any user exports a dataset',
        'One-Click Regeneration: If another user wants data based on the same filter, they can regenerate it directly from history',
        'Custom Column Export: Select specific checkboxes and ignore unwanted data columns during sheet download',
        'Download clean CSV or Excel sheets tailored specifically for outbound campaigns'
      ]
    },
    {
      id: 'crud_ops',
      label: 'Manual Records & Editing',
      title: 'Granular Data Updation & Manual Record Creation',
      icon: Edit3,
      badge: 'DATA INTEGRITY',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      description: 'Never let missing data slow down sales floors. If an imported spreadsheet lacked an email or phone number, reps can update individual company records or manually insert new accounts immediately.',
      points: [
        'Granular record editing allows quick fixes for missing prospect contact fields',
        'Manual Company Creation: Easily insert custom B2B accounts directly into the central DB',
        'Enforces clean data formatting while remaining flexible for daily rep updates',
        'All manual edits and creations are timestamped with operator audit traces',
        'Guarantees database completeness before assigning lists to sales reps'
      ]
    },
    {
      id: 'target_lists',
      label: 'Target Lists & Lead Status',
      title: 'Assigned Target Lists & Live Follow-Up Telemetry',
      icon: Target,
      badge: 'CAMPAIGN ENGINE',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      description: 'After filtering consolidated data, Admins have two options: standard sheet export OR creating a dedicated Target List assigned directly to Sales Users or Cold Mail Users for structured outreach.',
      points: [
        'Admin creates curated Target Lists assigned directly to specific Sales or Cold Mail reps',
        'Assigned reps access exclusively their allocated contact lists without touching core DB files',
        'Reps log real-time Lead Status (Assigned, Contacted, Meeting Scheduled, Proposal Sent, Negotiation, Won, Lost)',
        'Mandatory Next Follow-up timestamp scheduling tracked live on the Admin executive dashboard',
        'Global Status Color-Coding: Every disposition status has a unique global color across the entire project for instant identification'
      ]
    }
  ];

  return (
    <div className="w-full font-sans text-slate-900 select-none animate-fade-in bg-white flex flex-col min-h-screen">
      
      {/* ======================================= */}
      {/* SECTION 1: EDGE-TO-EDGE FULL SCREEN HERO */}
      {/* ======================================= */}
      <section className="relative w-full overflow-hidden bg-white text-slate-900 border-b border-slate-200/80 min-h-[85vh] flex flex-col justify-between select-none">
        
        {/* offfice.jpg Background Image - Corporate Meeting Room */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
          <img 
            src={heroBgImage} 
            alt="Corporate Office Hub Background" 
            className="w-full h-full object-cover object-center opacity-95 sm:opacity-100"
          />
          {/* Frosted white gradient fading from the right side towards left */}
          <div className="absolute inset-0 bg-white/85 sm:bg-transparent" />
          <div className="absolute inset-y-0 right-0 w-full lg:w-4/5 bg-gradient-to-l from-white via-white/80 to-transparent sm:from-white/70 sm:via-white/45 sm:to-transparent" />
        </div>

        <div className="w-full max-w-[1920px] mx-auto pl-4 sm:pl-10 lg:pl-12 pr-3 sm:pr-5 lg:pr-8 xl:pr-10 relative z-10 flex-1 flex flex-col justify-between pt-24 pb-8 sm:pt-28 sm:pb-16">
          <div className="space-y-5 sm:space-y-6 max-w-3xl lg:max-w-4xl ml-auto mr-0 text-left sm:text-right flex flex-col items-start sm:items-end my-auto py-6 sm:py-8">
            <h1 className="text-3xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-slate-900 leading-[1.12] sm:leading-[1.08]">
              The Single Source of Truth for{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Outbound Prospecting.
              </span>
            </h1>

            <p className="text-slate-700 text-base sm:text-xl leading-relaxed font-medium max-w-2xl">
              Stop managing scattered Excel spreadsheets and chaotic Drive folders. PDE consolidates multi-user company datasets into one unified database, rapidly scans files to eliminate duplicates automatically, and powers assigned Target List campaigns.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-start sm:justify-end gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
              <button
                onClick={handleAuthRedirect}
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm sm:text-base rounded-2xl shadow-md shadow-indigo-600/15 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer w-full sm:w-auto"
              >
                <span>{isAuthenticated ? 'Open Centralized Dashboard' : 'Get Started with PDE'}</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
              </button>
              <a
                href="#necessity"
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-sm sm:text-base rounded-2xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <span>Explore Working</span>
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 shrink-0" />
              </a>
            </div>
          </div>

          {/* True Sleek Glassmorphism Telemetry Highlights Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 pt-6 sm:pt-8 border-t border-slate-200/80 text-xs text-left">
            <div className="bg-white/60 sm:bg-white/45 backdrop-blur-xl p-3.5 sm:p-4.5 rounded-2xl shadow-lg hover:bg-white/65 transition-all duration-200">
              <div className="text-base sm:text-xl font-semibold text-slate-900 font-mono">Multi-User</div>
              <div className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5 font-medium">Central DB Consolidation</div>
            </div>
            <div className="bg-white/60 sm:bg-white/45 backdrop-blur-xl p-3.5 sm:p-4.5 rounded-2xl shadow-lg hover:bg-white/65 transition-all duration-200">
              <div className="text-base sm:text-xl font-semibold text-slate-900 font-mono">Rapid Scan</div>
              <div className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5 font-medium">Full File Scan Dedup</div>
            </div>
            <div className="bg-white/60 sm:bg-white/45 backdrop-blur-xl p-3.5 sm:p-4.5 rounded-2xl shadow-lg hover:bg-white/65 transition-all duration-200">
              <div className="text-base sm:text-xl font-semibold text-slate-900 font-mono">100% Unique</div>
              <div className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5 font-medium">Zero Duplicate Records</div>
            </div>
            <div className="bg-white/60 sm:bg-white/45 backdrop-blur-xl p-3.5 sm:p-4.5 rounded-2xl shadow-lg hover:bg-white/65 transition-all duration-200">
              <div className="text-base sm:text-xl font-semibold text-slate-900 font-mono">Regen Engine</div>
              <div className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5 font-medium">1-Click Filter History</div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT INNER CONTAINER FOR SECTIONS 2-6 */}
      <div className="w-full max-w-7xl mx-auto space-y-16 sm:space-y-24 py-12 sm:py-24 px-4 sm:px-14 lg:px-20 flex-1">

      {/* ======================================= */}
      {/* SECTION 2: WHY GROWING TEAMS NEED PDE */}
      {/* ======================================= */}
      <section id="necessity" className="space-y-12 scroll-mt-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-600 font-semibold block">// PROJECT NECESSITY &amp; CORE SOLUTION</span>
          <h2 className="text-3xl sm:text-5xl font-semibold text-slate-900 tracking-tight">
            Solving Scattered Spreadsheet Chaos
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
            When teams collect prospect records across different countries, industries, and cities in isolated Excel files, managing overlapping data becomes impossible. Here is the PDE advantage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-rose-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6 hover:shadow transition-shadow">
            <div className="flex items-center gap-3.5 text-rose-700 font-semibold text-xl border-b border-rose-100 pb-5">
              <div className="p-3 bg-rose-50 rounded-2xl text-rose-600 border border-rose-200">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <span>The Problem: Multiple Disconnected Files</span>
            </div>
            <ul className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              <li className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                <span><strong className="font-semibold text-slate-900">Overwhelming File Management:</strong> Arranging company info across dozens of separate Excel and Google Sheets makes data retrieval extremely slow.</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                <span><strong className="font-semibold text-slate-900">Awkward Double-Pitching:</strong> Without rapid central deduplication, multiple reps contact the exact same prospect companies repeatedly.</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                <span><strong className="font-semibold text-slate-900">Zero Activity Tracking:</strong> No history of who imported or exported files, making accountability and audit logs nonexistent.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-indigo-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6 hover:shadow transition-shadow">
            <div className="flex items-center gap-3.5 text-indigo-700 font-semibold text-xl border-b border-indigo-100 pb-5">
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 border border-indigo-200">
                <Database className="h-6 w-6" />
              </div>
              <span>The Solution: Centralized DB Consolidation</span>
            </div>
            <ul className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                <span><strong className="font-semibold text-slate-900">Multi-User Consolidation:</strong> 2 or more users upload their isolated files into one unified database, synchronizing all team datasets.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                <span><strong className="font-semibold text-slate-900">Rapid Full-File Scan Dedup:</strong> Fast scanning identifies duplicates within uploaded files and strips out records already residing in the DB.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                <span><strong className="font-semibold text-slate-900">Multi-Param Filtering &amp; Export:</strong> Filter consolidated records by country, city, industry &amp; turnover, with custom column selection.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ======================================= */}
      {/* SECTION 3: VIDEO SHOWCASE */}
      {/* ======================================= */}
      <section className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8 text-center max-w-6xl mx-auto">
        <div className="space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-600 font-semibold block">Live Telemetry Walkthrough</span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
            See Rapid File Ingestion in Action
          </h2>
          <p className="text-slate-500 text-sm sm:text-base font-normal">
            Watch how multiple prospect files are imported, rapidly scanned against existing database records, and sliced for outbound teams.
          </p>
        </div>

        <div className="w-full aspect-video rounded-3xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden relative">
          <video autoPlay muted loop playsInline className="w-full h-full object-cover">
            <source src={heroVideo} type="video/mp4" />
          </video>
        </div>
      </section>

      {/* ======================================= */}
      {/* SECTION 4: PLATFORM PILLARS (OPEN GRID) */}
      {/* ======================================= */}
      <section className="space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-blue-600 font-semibold block">// CORE PLATFORM ARCHITECTURE</span>
          <h2 className="text-3xl sm:text-5xl font-semibold text-slate-900 tracking-tight">
            Comprehensive Platform Scope
          </h2>
          <p className="text-slate-600 text-base sm:text-lg font-normal">
            Explore the complete technical depth of Prospect Data Engine, rendered openly without hidden tabs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {platformPillars.map((pillar) => {
            const IconComponent = pillar.icon;
            return (
              <div 
                key={pillar.id}
                className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm hover:shadow transition-all flex flex-col justify-between space-y-8"
              >
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-3.5">
                      <div className={`p-3.5 rounded-2xl border ${pillar.iconBg}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <span className="text-lg font-semibold text-slate-900 tracking-tight">{pillar.label}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-semibold font-mono uppercase border ${pillar.badgeClass}`}>
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 leading-snug">
                    {pillar.title}
                  </h3>

                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                    {pillar.description}
                  </p>

                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-mono font-semibold text-indigo-600 uppercase tracking-wider block">// Operational Checklist</span>
                    <ul className="space-y-3 text-sm text-slate-600 font-normal">
                      {pillar.points.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="h-4 w-4 text-indigo-600 shrink-0 mt-1" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>MODULE: {pillar.id.toUpperCase()}</span>
                  <span className="text-emerald-600 font-semibold">• ACTIVE</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================= */}
      {/* SECTION 5: TARGET LIST CAMPAIGN & LEAD LIFECYCLE */}
      {/* ======================================= */}
      <section className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm space-y-10">
        <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-semibold text-amber-600 uppercase tracking-wider block">// CAMPAIGN EXECUTION WORKFLOW</span>
            <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Target List &amp; Lead Updation Lifecycle</h2>
          </div>
          <div className="px-4 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium self-start sm:self-auto">
            <span>Live Executive Tracking</span>
          </div>
        </div>

        <p className="text-base text-slate-600 leading-relaxed max-w-4xl font-normal">
          After data is filtered, Admins have two options: export data directly OR generate a curated Target List. When assigned to reps, outbound prospecting follows a strict accountable workflow:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative group hover:shadow-2xl hover:shadow-slate-900/25 hover:-translate-y-1.5 transition-all duration-300">
            <span className="h-8 w-8 rounded-xl bg-indigo-600 text-white font-mono font-semibold text-xs flex items-center justify-center shadow-sm">01</span>
            <h4 className="font-semibold text-slate-900 text-base">Filter Central DB</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">Admin filters consolidated DB by country, city, industry &amp; turnover brackets.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative group hover:shadow-2xl hover:shadow-slate-900/25 hover:-translate-y-1.5 transition-all duration-300">
            <span className="h-8 w-8 rounded-xl bg-blue-600 text-white font-mono font-semibold text-xs flex items-center justify-center shadow-sm">02</span>
            <h4 className="font-semibold text-slate-900 text-base">Create Target List</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">Admin chooses to export OR generate a dedicated Target List assigned to reps.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative group hover:shadow-2xl hover:shadow-slate-900/25 hover:-translate-y-1.5 transition-all duration-300">
            <span className="h-8 w-8 rounded-xl bg-violet-600 text-white font-mono font-semibold text-xs flex items-center justify-center shadow-sm">03</span>
            <h4 className="font-semibold text-slate-900 text-base">Rep Notification</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">Assigned rep (Sales or Cold Mail) receives email alert &amp; opens exclusive lead view.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative group hover:shadow-2xl hover:shadow-slate-900/25 hover:-translate-y-1.5 transition-all duration-300">
            <span className="h-8 w-8 rounded-xl bg-emerald-600 text-white font-mono font-semibold text-xs flex items-center justify-center shadow-sm">04</span>
            <h4 className="font-semibold text-slate-900 text-base">Update Status</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">Rep conducts outreach, logging exact Lead Status (Assigned, Contacted, Meeting Scheduled, Proposal Sent, Negotiation, Won, Lost).</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative group hover:shadow-2xl hover:shadow-slate-900/25 hover:-translate-y-1.5 transition-all duration-300">
            <span className="h-8 w-8 rounded-xl bg-amber-600 text-white font-mono font-semibold text-xs flex items-center justify-center shadow-sm">05</span>
            <h4 className="font-semibold text-slate-900 text-base">Set Next Follow-up</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">Rep schedules mandatory Next Follow-up timestamp tracked live by Admin dashboard.</p>
          </div>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-sm">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-base">Global Status Color-Coding &amp; Operator Audit</h4>
              <p className="text-xs text-slate-600 mt-0.5 font-normal">Every prospect record in PDE is tagged with one of the 7 standardized global disposition statuses below. These colors remain consistent across tables, target lists, and campaign reports for instant executive clarity.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 pt-3 border-t border-slate-200/80 text-xs font-semibold text-slate-700">
            <div className="inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0" />
              <span>Assigned</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500 shrink-0" />
              <span>Contacted</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500 shrink-0" />
              <span>Meeting Scheduled</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 shrink-0" />
              <span>Proposal Sent</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
              <span>Negotiation</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Won</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0" />
              <span>Lost</span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================= */}
      {/* SECTION 6: EXECUTIVE DARK TECH HUB CTA */}
      {/* ======================================= */}
      <section className="max-w-5xl mx-auto pb-12 px-4 sm:px-0">
        <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-center space-y-8 shadow-2xl relative overflow-hidden">
          {/* Ambient Glowing Orbs */}
          <div className="absolute -right-20 -top-20 h-80 w-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-80 w-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 max-w-2xl mx-auto relative z-10">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-semibold block">// FUTURE GROWTH &amp; SCALE</span>
            <h2 className="text-3xl sm:text-5xl font-semibold text-white tracking-tight">
              Ready to Centralize Your Prospecting Hub?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg font-normal">
              Empower multi-user floors with rapid file deduplication, one-click filter query regeneration, and accountable target list campaigns.
            </p>
          </div>

          <div className="pt-4 relative z-10 space-y-6">
            <button
              onClick={handleAuthRedirect}
              className="w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm sm:text-lg rounded-2xl shadow-xl shadow-white/10 transition-all duration-200 hover:-translate-y-0.5 inline-flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>{isAuthenticated ? 'Open Workspace Dashboard' : 'Enter PDE Workspace Now'}</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 shrink-0" />
            </button>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium pt-2">
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Instant Floor Setup</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> Enterprise RBAC Security</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> Live Dedup Engine</span>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
