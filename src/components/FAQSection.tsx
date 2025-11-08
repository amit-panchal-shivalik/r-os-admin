import React, { useState } from 'react';

const faqs = [
  {
    question: 'What is R-OS?',
    answer:
      'R-OS (Real-Estate Operating System) is a platform connecting everyone in the real estate ecosystem—buyers, sellers, investors, vendors, and professionals—enabling direct connections and seamless transactions.',
  },
  {
    question: 'Who can join the community?',
    answer:
      'Anyone interested in real estate—whether you want to buy, sell, rent, invest, or offer related services—can join and benefit from our platform.',
  },
  {
    question: 'How do I list my property or service?',
    answer:
      'Simply sign up, navigate to the relevant section, and post your property or service. Our platform makes it easy to connect with interested parties directly.',
  },
  {
    question: 'Is there a fee to join?',
    answer:
      'Joining the community is free. Some premium features or services may have associated costs, which will be clearly mentioned.',
  },
  {
    question: 'How is R-OS different from other portals?',
    answer:
      'R-OS is not just a listing site—it’s a full ecosystem for all real estate needs, fostering direct connections and community growth, with a focus on transparency and collaboration.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-card py-14 px-6 animate-fade-in-up">
      <div className="container mx-auto max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border rounded-xl overflow-hidden shadow-sm bg-background transition-all">
              <button
                className="w-full flex justify-between items-center px-6 py-4 text-left focus:outline-none focus:bg-primary/10 hover:bg-primary/5 transition-all"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                aria-expanded={openIndex === idx}
              >
                <span className="font-semibold text-lg">{faq.question}</span>
                <span className={`ml-4 transform transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`}>▼</span>
              </button>
              <div
                className={`px-6 pb-4 text-muted-foreground text-base transition-all duration-300 ease-in-out ${openIndex === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}
                style={{ transitionProperty: 'max-height, opacity' }}
              >
                {openIndex === idx && <div>{faq.answer}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
