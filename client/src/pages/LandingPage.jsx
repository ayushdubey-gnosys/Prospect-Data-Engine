import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Search, Shield, Zap, ArrowRight, BarChart3, Layers, Video, FileDown } from 'lucide-react';
import Footer from '../layouts/Footer';
import heroVideo from '../assets/PDE 01 .mp4';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300 group">
    <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-slate-50 flex flex-col items-center">
      
      {/* Centered Professional Hero Section */}
      <section className="w-full max-w-5xl mx-auto px-6 py-20 lg:py-32 flex flex-col items-center text-center relative z-10">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-indigo-500/10 via-blue-500/10 to-purple-500/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

        <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full font-medium text-xs sm:text-sm mb-8 shadow-sm">
          <Zap className="h-4 w-4 text-indigo-600 fill-indigo-600 animate-pulse" />
          <span>Centralized Prospect Data Engine</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.12]">
          Unlock the{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            Industrial Data
          </span>{' '}
          Engine.
        </h1>
        
        <p className="text-base sm:text-xl text-slate-600 mb-12 leading-relaxed max-w-2xl mx-auto">
          The ultimate centralized platform for consolidating, analyzing, and transforming your industrial prospect matrices into high-accuracy business intelligence.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center w-full sm:w-auto gap-4 mb-16">
          <button 
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center text-sm sm:text-base"
          >
            Access Platform
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          <button 
            onClick={() => navigate('/about')}
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 transition-all duration-200 text-sm sm:text-base shadow-sm hover:shadow flex items-center justify-center"
          >
            Learn More
          </button>
        </div>

        <div className="pt-8 border-t border-slate-200/80 w-full max-w-3xl flex flex-wrap items-center justify-center sm:justify-between gap-6 text-slate-500 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            Real-Time Node Sync
          </div>
          <div className="font-medium text-slate-600">50M+ Verified Records</div>
          <div className="font-semibold text-indigo-600">99.9% Pipeline Accuracy</div>
        </div>
      </section>

      {/* Full Screen Video Showcase Section */}
      <section className="w-full min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center relative py-20 px-6 overflow-hidden border-t border-slate-800">
        {/* Background ambient lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none -z-0"></div>
        <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none -z-0"></div>

        <div className="w-full max-w-7xl mx-auto flex flex-col items-center text-center relative z-10 my-auto">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-4 py-1.5 rounded-full font-medium text-xs sm:text-sm mb-6 backdrop-blur-md">
            <Video className="h-4 w-4 text-indigo-400" />
            <span>Interactive Architecture Tour</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 max-w-3xl">
            See the Prospect Data Engine in Action
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mb-12">
            Experience how our intelligent processing node extracts, categorizes, and serves high-volume prospect matrices in milliseconds.
          </p>

          {/* Video Player Showcase */}
          <div className="w-full max-w-5xl aspect-video rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl relative overflow-hidden flex items-center justify-center shadow-indigo-950/50">
            <video 
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover rounded-3xl relative z-10 pointer-events-none"
            >
              <source src={heroVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-white border-t border-slate-200 py-24 flex-grow">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Engineered for Excellence</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Everything you need to manage your industrial prospect data seamlessly from one unified dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Database}
              title="Centralized Storage"
              description="Bring all your disparate data sources together into a single, high-performance data node."
            />
            <FeatureCard 
              icon={Search}
              title="Advanced Search"
              description="Query millions of records instantly with our highly optimized indexing architecture."
            />
            <FeatureCard 
              icon={Shield}
              title="Enterprise Security"
              description="Role-based access control and encrypted storage to keep your most valuable asset safe."
            />
            <FeatureCard 
              icon={BarChart3}
              title="Real-time Analytics"
              description="Generate insights on the fly with built-in visualization and reporting tools."
            />
            <FeatureCard 
              icon={Layers}
              title="Target Lists"
              description="Assign particular data lists to specific users and track all updates in real-time as an admin."
            />
            <FeatureCard 
              icon={FileDown}
              title="Filtered Data Export"
              description="Apply granular filters to prospect datasets and export targeted lists directly into CSV or Excel workbooks."
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
