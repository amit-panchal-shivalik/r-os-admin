import React, { useState } from 'react';

const faqs = [
  {
    question: 'What is R-OS?',
    answer: 'R-OS (Real-Estate Operating System) is a platform connecting everyone in the real estate ecosystem—buyers, sellers, investors, vendors, and professionals—enabling direct connections and seamless transactions.',
  },
  {
    question: 'Who can join the community?',
    answer: 'Anyone interested in real estate—whether you want to buy, sell, rent, invest, or offer related services—can join and benefit from our platform.',
  },
  {
    question: 'How do I list my property or service?',
    answer: 'Simply sign up, navigate to the relevant section, and post your property or service. Our platform makes it easy to connect with interested parties directly.',
  },
  {
    question: 'Is there a fee to join?',
    answer: 'Joining the community is free. Some premium features or services may have associated costs, which will be clearly mentioned.',
  },
  {
    question: 'How is R-OS different from other portals?',
    answer: 'R-OS is not just a listing site—it\'s a full ecosystem for all real estate needs, fostering direct connections and community growth, with a focus on transparency and collaboration.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative py-24 px-6 bg-background overflow-hidden">
      {/* Futuristic Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse-slower" />

      <div className="container mx-auto max-w-3xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-6 py-3 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
            <span className="text-primary font-semibold text-sm tracking-wider">FAQ</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-light mb-4 tracking-tight">
            Common Questions
          </h2>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            Everything you need to know about R-OS
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="group"
            >
              <button
                className="w-full flex justify-between items-center p-8 text-left bg-background/40 backdrop-blur-sm border rounded-2xl hover:bg-background/60 transition-all duration-500 group-hover:border-primary/30"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                aria-expanded={openIndex === idx}
              >
                <div className="flex items-start space-x-6">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${
                    openIndex === idx ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary/60'
                  }`}>
                    <span className="text-sm font-semibold">{idx + 1}</span>
                  </div>
                  <span className="text-xl font-light text-left tracking-tight">{faq.question}</span>
                </div>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                  openIndex === idx 
                    ? 'bg-primary border-primary text-background rotate-180' 
                    : 'border-primary/30 text-primary/60 group-hover:border-primary'
                }`}>
                  <svg 
                    className="w-4 h-4 transition-transform duration-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              <div className={`overflow-hidden transition-all duration-700 ease-in-out ${
                openIndex === idx ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="p-8 pt-6">
                  <div className="flex space-x-6">
                    <div className="w-8 flex-shrink-0">
                      <div className="w-px h-full bg-primary/20 mx-auto"></div>
                    </div>
                    <p className="text-lg text-muted-foreground font-light leading-relaxed pt-2">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-background/40 backdrop-blur-sm rounded-2xl p-8 border">
            <h3 className="text-2xl font-light mb-4">Still have questions?</h3>
            <p className="text-muted-foreground font-light mb-6">
              Get in touch with our team for more information
            </p>
            <button className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-light hover:bg-primary/90 transition-all duration-300 hover:scale-105">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}