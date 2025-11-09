import React from 'react';

export default function VisionSection() {
  return (
    <section className="relative py-24 px-6 bg-background overflow-hidden">
      {/* Futuristic Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      
      {/* Animated Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse-slower" />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Main Header - Ultra Minimal */}
        <div className="text-center mb-20">
          <div className="inline-block px-6 py-3 rounded-2xl bg-primary/10 border border-primary/20 mb-8">
            <span className="text-primary font-semibold text-sm tracking-wider">R-OS PLATFORM</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-light mb-6 tracking-tight">
            Real Estate
            <span className="block text-primary font-normal mt-2">Reimagined</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            One operating system for every real estate need. Simple, connected, powerful.
          </p>
        </div>

        {/* Core Value Proposition - Clean Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          <div className="text-center p-8 rounded-3xl bg-background/40 backdrop-blur-sm border hover:bg-background/60 transition-all duration-500 group">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
              <span className="text-2xl">🔗</span>
            </div>
            <h3 className="text-2xl font-light mb-4">All Stakeholders</h3>
            <p className="text-muted-foreground font-light">
              Buyers, sellers, investors, vendors—united in one ecosystem
            </p>
          </div>

          <div className="text-center p-8 rounded-3xl bg-background/40 backdrop-blur-sm border hover:bg-background/60 transition-all duration-500 group">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-2xl font-light mb-4">Direct Connect</h3>
            <p className="text-muted-foreground font-light">
              Post needs, get matched, connect instantly—no intermediaries
            </p>
          </div>

          <div className="text-center p-8 rounded-3xl bg-background/40 backdrop-blur-sm border hover:bg-background/60 transition-all duration-500 group">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
              <span className="text-2xl">🌐</span>
            </div>
            <h3 className="text-2xl font-light mb-4">Complete Ecosystem</h3>
            <p className="text-muted-foreground font-light">
              Everything real estate in one seamless platform
            </p>
          </div>
        </div>

        {/* Visual Representation - Ultra Clean */}
        <div className="relative max-w-4xl mx-auto mb-20">
          <div className="bg-gradient-to-br from-background to-primary/5 rounded-3xl p-12 border backdrop-blur-sm">
            <div className="flex justify-between items-center mb-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏠</span>
                </div>
                <p className="font-light">Property Seekers</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💼</span>
                </div>
                <p className="font-light">Investors</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔧</span>
                </div>
                <p className="font-light">Vendors</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⭐</span>
                </div>
                <p className="font-light">Professionals</p>
              </div>
            </div>
            
            {/* Connection Lines */}
            <div className="relative h-2 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-full mb-12">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-pulse"></div>
            </div>

            <div className="text-center">
              <h3 className="text-3xl font-light mb-4">Connected by R-OS</h3>
              <p className="text-muted-foreground font-light text-lg">
                The operating system that powers real estate connections
              </p>
            </div>
          </div>
        </div>

        {/* Single Powerful Statement */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="bg-background/40 backdrop-blur-sm rounded-3xl p-12 border">
            <h3 className="text-3xl font-light mb-6 text-primary">
              One Platform, Infinite Possibilities
            </h3>
            <p className="text-xl text-muted-foreground font-light leading-relaxed">
              R-OS eliminates complexity by bringing every real estate interaction into one intuitive, 
              powerful system. No more jumping between apps—just seamless connections and results.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}