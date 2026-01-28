'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { TripPlan } from '@/types/trip';
import { generateICS, generatePDF, generateShareableLink, downloadFile } from '@/lib/services/export';

interface ShareExportPanelProps {
  plan: TripPlan;
}

export function ShareExportPanel({ plan }: ShareExportPanelProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);

  const copyLink = async () => {
    try {
      // Generate shareable link
      setGenerating(true);
      const shareableLink = await generateShareableLink(plan);
      await navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      alert('Kunne ikke kopiere lenke. Prøv igjen.');
    } finally {
      setGenerating(false);
    }
  };

  const exportToCalendar = () => {
    try {
      const icsContent = generateICS(plan);
      downloadFile(icsContent, 'tromso-trip.ics', 'text/calendar');
    } catch (error) {
      console.error('Failed to export calendar:', error);
      alert('Kunne ikke eksportere til kalender. Prøv igjen.');
    }
  };

  const exportToPDF = async () => {
    try {
      setGenerating(true);
      const pdfBlob = await generatePDF(plan);
      downloadFile(pdfBlob, 'tromso-trip-plan.pdf', 'application/pdf');
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Kunne ikke eksportere PDF. Prøv igjen.');
    } finally {
      setGenerating(false);
    }
  };

  const printPlan = () => {
    window.print();
  };

  const savePlan = () => {
    try {
      const planData = {
        plan,
        savedAt: new Date().toISOString(),
        url: window.location.href,
      };

      // Save to localStorage
      const savedPlans = localStorage.getItem('saved-trip-plans');
      const plans = savedPlans ? JSON.parse(savedPlans) : [];
      plans.push(planData);

      // Keep only last 10 plans
      if (plans.length > 10) {
        plans.shift();
      }

      localStorage.setItem('saved-trip-plans', JSON.stringify(plans));

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save plan:', error);
      alert('Kunne ikke lagre turplan. Prøv igjen.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="bg-arctic-800 rounded-2xl p-6 border border-arctic-700">
        <h3 className="text-lg font-semibold mb-2">Del eller lagre turplanen din</h3>
        <p className="text-sm text-muted-foreground">
          Lagre turplanen lokalt, skriv den ut, eller del lenken med andre.
        </p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Copy Link */}
        <button
          onClick={copyLink}
          className={cn(
            'flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all',
            'hover:border-primary/50 hover:bg-arctic-700/50',
            copied
              ? 'border-green-500 bg-green-500/10'
              : 'border-arctic-700 bg-arctic-800'
          )}
        >
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            {copied ? (
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </div>
          <div className="text-center">
            <div className="font-semibold mb-1">{copied ? 'Kopiert!' : 'Kopier lenke'}</div>
            <div className="text-xs text-muted-foreground">
              {copied ? 'Lenken er kopiert' : 'Del med venner og familie'}
            </div>
          </div>
        </button>

        {/* Print */}
        <button
          onClick={printPlan}
          className={cn(
            'flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all',
            'hover:border-primary/50 hover:bg-arctic-700/50',
            'border-arctic-700 bg-arctic-800'
          )}
        >
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
          </div>
          <div className="text-center">
            <div className="font-semibold mb-1">Skriv ut</div>
            <div className="text-xs text-muted-foreground">Print turplanen</div>
          </div>
        </button>

        {/* Save Locally */}
        <button
          onClick={savePlan}
          className={cn(
            'flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all',
            'hover:border-primary/50 hover:bg-arctic-700/50',
            saved
              ? 'border-green-500 bg-green-500/10'
              : 'border-arctic-700 bg-arctic-800'
          )}
        >
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            {saved ? (
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
            )}
          </div>
          <div className="text-center">
            <div className="font-semibold mb-1">{saved ? 'Lagret!' : 'Lagre lokalt'}</div>
            <div className="text-xs text-muted-foreground">
              {saved ? 'Turplan lagret' : 'Lagre i nettleseren'}
            </div>
          </div>
        </button>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export to Calendar */}
        <button
          onClick={exportToCalendar}
          className={cn(
            'flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all',
            'hover:border-primary/50 hover:bg-arctic-700/50',
            'border-arctic-700 bg-arctic-800'
          )}
        >
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="text-center">
            <div className="font-semibold mb-1">Eksporter til kalender</div>
            <div className="text-xs text-muted-foreground">Last ned .ics fil</div>
          </div>
        </button>

        {/* Export to PDF */}
        <button
          onClick={exportToPDF}
          disabled={generating}
          className={cn(
            'flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all',
            'hover:border-primary/50 hover:bg-arctic-700/50',
            'border-arctic-700 bg-arctic-800',
            generating && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            {generating ? (
              <svg className="w-6 h-6 text-primary animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            )}
          </div>
          <div className="text-center">
            <div className="font-semibold mb-1">{generating ? 'Genererer...' : 'Last ned PDF'}</div>
            <div className="text-xs text-muted-foreground">
              {generating ? 'Vennligst vent' : 'Fullt detaljert turplan'}
            </div>
          </div>
        </button>
      </div>

      {/* Coming Soon */}
      <div className="bg-arctic-800/50 rounded-2xl p-6 border border-arctic-700 border-dashed">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <span>🚀</span>
          Kommer snart
        </h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="text-primary">•</span>
            Del på sosiale medier (Facebook, Twitter, Email)
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">•</span>
            Direkte booking av aktiviteter og restauranter
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">•</span>
            Lagre flere turplaner og sammenligne
          </li>
        </ul>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
            color: black;
          }

          header,
          nav,
          button,
          .no-print {
            display: none !important;
          }

          .print-show {
            display: block !important;
          }

          * {
            color: black !important;
            background: white !important;
            border-color: #ccc !important;
          }
        }
      `}</style>
    </div>
  );
}
