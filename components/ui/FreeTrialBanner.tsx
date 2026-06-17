import React from 'react';

export default function FreeTrialBanner() {
  return (
    <div className="container mx-auto px-4 md:px-12 mt-16 md:mt-24">
      <div className="relative w-full rounded-2xl overflow-hidden border border-[#262628] bg-[#0A0A0A] flex flex-col md:flex-row items-center justify-between p-8 md:p-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#0F0F0F] opacity-90 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F0F] via-[#0F0F0F]/80 to-transparent z-10 hidden md:block" />
          {/* We use a simple placeholder background pattern for the collage */}
          <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center opacity-30 mix-blend-overlay" />
        </div>
        
        <div className="relative z-20 flex flex-col md:max-w-2xl text-center md:text-left mb-8 md:mb-0">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
            Start your free trial today!
          </h2>
          <p className="text-[#999999] text-sm md:text-base leading-relaxed">
            This is a clear and concise call to action that encourages users to sign up for a free trial of StreamVibe.
          </p>
        </div>
        
        <div className="relative z-20 shrink-0">
          <button className="bg-[#E50000] hover:bg-red-700 text-white font-semibold py-3 md:py-4 px-6 md:px-8 rounded-lg transition-colors cursor-pointer text-sm md:text-base whitespace-nowrap shadow-lg shadow-[#E50000]/20">
            Start a Free Trial
          </button>
        </div>
      </div>
    </div>
  );
}
