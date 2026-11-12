import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-accent-soft border border-accent/20 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-200">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-text-primary">
              MINIMI
            </span>
            <span className="text-[10px] text-text-secondary uppercase tracking-widest font-medium">
              Research Agent
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-text-secondary">
          <a href="#overview" className="hover:text-text-primary transition-colors">
            Product
          </a>
          <a href="#features" className="hover:text-text-primary transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-text-primary transition-colors">
            How It Works
          </a>
          <a href="#capabilities" className="hover:text-text-primary transition-colors">
            Architecture
          </a>
        </nav>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-medium shadow-subtle transition-all duration-150 active:scale-[0.98]"
          >
            <span>Start researching</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <a
            href="#overview"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-2 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
          >
            Product
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-2 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-2 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
          >
            How It Works
          </a>
          <a
            href="#capabilities"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-2 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
          >
            Architecture
          </a>
          <div className="pt-2 border-t border-border">
            <Link
              to="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-accent text-white text-xs font-medium shadow-subtle"
            >
              <span>Start researching</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
