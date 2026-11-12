import React from 'react';
import { Navbar } from '../components/landing/Navbar.js';
import { HeroSection } from '../components/landing/HeroSection.js';
import { TrustStrip } from '../components/landing/TrustStrip.js';
import { FeaturesSection } from '../components/landing/FeaturesSection.js';
import { HowItWorksSection } from '../components/landing/HowItWorksSection.js';
import { CtaSection } from '../components/landing/CtaSection.js';
import { Footer } from '../components/landing/Footer.js';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-accent-soft selection:text-accent-hover flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <TrustStrip />
        <FeaturesSection />
        <HowItWorksSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};
