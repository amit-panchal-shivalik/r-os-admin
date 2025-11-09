import React from 'react';
import { Link } from 'react-router-dom';
import { useCommunityStore } from '@/store/communityStore';
import CommunitiesList from './CommunitiesList';

export default function OverviewSection() {
  return (
    <section className="relative py-24 px-6 bg-background overflow-hidden">
      {/* Futuristic Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-6 py-3 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
            <span className="text-primary font-semibold text-sm tracking-wider">COMMUNITIES</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-light mb-4 tracking-tight">
            Featured Communities
          </h2>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            Connect with specialized real estate communities
          </p>
        </div>

        {/* Communities List */}
        <div className="mb-12">
          <CommunitiesList />
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/listing">
            <button className="group px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-light hover:bg-primary/90 transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-xl">
              <span className="flex items-center gap-3">
                Explore All Communities
                <svg 
                  className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}