import React from 'react';
import { Sparkles, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-24 border-t border-stone-border bg-cream-50 py-12 text-xs text-stone-muted no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-forest-700 flex items-center justify-center text-cream-50">
            <Sparkles className="w-3.5 h-3.5 text-gold-300" />
          </div>
          <span className="font-serif font-bold text-sm text-forest-900">Gatherly</span>
          <span className="text-stone-muted">| Engineered for Prompt Wars Challenge 5</span>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-stone-muted">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-forest-700" />
            Zero External Tracking & Client-Side Privacy
          </span>
          <span>WCAG 2.1 AA Compliant</span>
          <span>Google Gemini 1.5 Integration</span>
        </div>
      </div>
    </footer>
  );
};
