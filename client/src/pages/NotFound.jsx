import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Home } from 'lucide-react';
import notFoundImage from '../assets/PNF404.png';

const NotFound = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleBackHome = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#030712] select-none">
      {/* Full Screen Background Image */}
      <img
        src={notFoundImage}
        alt="404 Page Not Found"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Back to Home Button placed below main image text on right side */}
      <div className="absolute top-[73%] left-[68%] -translate-x-1/2 z-[9999]">
        <button
          onClick={handleBackHome}
          className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-transparent hover:bg-white/10 text-white font-semibold text-base sm:text-lg shadow-[0_10px_35px_rgba(0,0,0,0.7)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.9)] backdrop-blur-md border border-white/30 hover:border-white/50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
        >
          <Home className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
};

export default NotFound;
