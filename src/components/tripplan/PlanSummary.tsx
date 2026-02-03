'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { TripPlan } from '@/types/trip';

interface PlanSummaryProps {
  plan: TripPlan;
}

export function PlanSummary({ plan }: PlanSummaryProps) {
  const [showSafetyNotes, setShowSafetyNotes] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const totalActivities = plan.days.reduce((sum, day) => sum + day.activities.length, 0);
  const auroraOpportunities = plan.days.filter((day) => day.aurora && day.aurora.probability > 40).length;

  return (
    <div className="space-y-6">
      {/* Summary Text */}
      <div className="bg-arctic-800 rounded-2xl p-6 border border-arctic-700">
        <h2 className="text-xl font-bold mb-3">Your personalized trip plan</h2>
        <p className="text-foreground/90 leading-relaxed">{plan.summary}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-arctic-800 rounded-xl p-4 border border-arctic-700">
          <div className="text-3xl font-bold text-primary mb-1">{plan.days.length}</div>
          <div className="text-sm text-muted-foreground">
            {plan.days.length === 1 ? 'Dag' : 'Dager'}
          </div>
        </div>

        <div className="bg-arctic-800 rounded-xl p-4 border border-arctic-700">
          <div className="text-3xl font-bold text-primary mb-1">
            {plan.totalCost.toLocaleString('en-US')}
          </div>
          <div className="text-sm text-muted-foreground">NOK total</div>
        </div>

        <div className="bg-arctic-800 rounded-xl p-4 border border-arctic-700">
          <div className="text-3xl font-bold text-primary mb-1">{totalActivities}</div>
          <div className="text-sm text-muted-foreground">
            {totalActivities === 1 ? 'Activity' : 'Activities'}
          </div>
        </div>

        <div className="bg-arctic-800 rounded-xl p-4 border border-arctic-700">
          <div className="text-3xl font-bold text-primary mb-1">{auroraOpportunities}</div>
          <div className="text-sm text-muted-foreground">
            Aurora {auroraOpportunities === 1 ? 'opportunity' : 'opportunities'}
          </div>
        </div>
      </div>

      {/* Safety Notes */}
      {plan.safetyNotes && plan.safetyNotes.length > 0 && (
        <div className="bg-arctic-800 rounded-2xl border border-arctic-700 overflow-hidden">
          <button
            onClick={() => setShowSafetyNotes(!showSafetyNotes)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-arctic-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <span className="font-semibold">Sikkerhetsnotater</span>
            </div>
            <svg
              className={cn(
                'w-5 h-5 transition-transform',
                showSafetyNotes && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {showSafetyNotes && (
            <div className="px-6 pb-4">
              <ul className="space-y-2">
                {plan.safetyNotes.map((note, index) => (
                  <li key={index} className="flex gap-2 text-sm text-foreground/80">
                    <span className="text-primary mt-1">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      {plan.recommendations && plan.recommendations.length > 0 && (
        <div className="bg-arctic-800 rounded-2xl border border-arctic-700 overflow-hidden">
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-arctic-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">💡</span>
              <span className="font-semibold">Anbefalinger</span>
            </div>
            <svg
              className={cn(
                'w-5 h-5 transition-transform',
                showRecommendations && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {showRecommendations && (
            <div className="px-6 pb-4">
              <ul className="space-y-2">
                {plan.recommendations.map((rec, index) => (
                  <li key={index} className="flex gap-2 text-sm text-foreground/80">
                    <span className="text-primary mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
