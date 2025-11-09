import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function HeroSection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const handleExplore = () => {
    if (isAuthenticated) {
      navigate('/listing');
    } else {
      navigate('/auth/login');
    }
  };
  return (
    <section className="relative flex flex-col md:flex-row items-center justify-between px-6 md:px-12 lg:px-20 py-16 bg-gradient-to-br from-primary/15 via-background to-secondary/10 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute -bottom-32 -right-24 w-96 h-96 bg-secondary/25 rounded-full blur-3xl animate-pulse-slower" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/10 rounded-full blur-2xl animate-blob" />
      
      <div className="max-w-xl z-10 animate-fade-in-up">
        {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
          <span className="text-sm font-medium text-primary">The Future of Real Estate is Here</span>
        </div> */}
        
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
          Your Real Estate
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">
            Community Platform
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 text-muted-foreground leading-relaxed">
          Where <strong className="text-foreground">buyers find dream homes</strong>,{' '}
          <strong className="text-foreground">sellers maximize value</strong>, and{' '}
          <strong className="text-foreground">professionals thrive together</strong> in one powerful ecosystem.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            onClick={handleExplore}
          >
            Explore All Communities
          </button>
        </div>

      
      </div>
      
      <div className="flex-1 flex justify-center md:justify-end mt-12 md:mt-0 animate-fade-in">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
          <img
            src="/hero-img.jpg"
            alt="Real Estate Community Platform"
            className="relative w-[400px] rounded-2xl shadow-2xl object-cover border border-primary/30 "
          />
          
          {/* Floating Cards */}
          {/* <div className="absolute -bottom-6 -left-6 bg-background/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border animate-float">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏠</span>
              </div>
              <div>
                <p className="font-semibold text-sm">500+ Properties</p>
                <p className="text-xs text-muted-foreground">Live Today</p>
              </div>
            </div>
          </div> */}
          
          {/* <div className="absolute -top-6 -right-6 bg-background/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border animate-float-delayed">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <div>
                <p className="font-semibold text-sm">4.9/5 Rating</p>
                <p className="text-xs text-muted-foreground">Trusted Platform</p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
}