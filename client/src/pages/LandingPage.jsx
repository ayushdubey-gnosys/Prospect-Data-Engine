import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Search, Shield, Zap, ArrowRight, BarChart3, Layers } from 'lucide-react';
import Footer from '../layouts/Footer';

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
      
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-6 py-20 lg:py-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-medium text-sm mb-8 animate-fade-in-up">
          <Zap className="h-4 w-4 text-blue-500" />
          <span>Introducing Prospect Data Engine</span>
        </div>
        
        <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
          Unlock the Power of <br className="hidden lg:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Industrial Data
          </span>
        </h1>
        
        <p className="text-lg lg:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed">
          The ultimate platform for consolidating, analyzing, and transforming your prospect data into actionable business intelligence. Built for scale, secured by design.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button 
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            Access Platform
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          <button 
            onClick={() => navigate('/about')}
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-all duration-200"
          >
            Learn More
          </button>
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
              icon={Zap}
              title="Lightning Fast"
              description="Built on modern web technologies ensuring a snappy, responsive experience at all times."
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
