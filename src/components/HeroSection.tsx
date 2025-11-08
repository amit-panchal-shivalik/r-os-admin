import React from 'react';

export default function HeroSection() {
  return (
    <section className="relative flex flex-col md:flex-row items-center justify-between px-8 py-20 bg-gradient-to-br from-primary/10 to-background overflow-hidden">
      <div className="max-w-xl z-10 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
          Connecting Real Estate, <span className="text-primary">Empowering Communities</span>
        </h1>
        <p className="text-lg md:text-xl mb-8 text-muted-foreground">
          R-OS is your one-stop solution for everyone in real estate—buyers, sellers, investors, vendors, and professionals. Join the largest real estate community and connect, collaborate, and grow together.
        </p>
      </div>
      <div className="flex-1 flex justify-center md:justify-end animate-fade-in">
        <img
          src="/static-hero.jpg"
          alt="Community Hero"
          className="w-[350px] md:w-[420px] rounded-3xl shadow-xl object-cover border border-primary/20 animate-zoom-in"
        />
      </div>
      {/* Decorative animated blobs */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-blob1" />
      <div className="absolute -bottom-24 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-blob2" />
    </section>
  );
}
