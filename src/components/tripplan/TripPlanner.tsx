'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTripPlanner } from '@/hooks/useTripPlanner';
import { TripPreferencesForm } from './TripPreferencesForm';
import { PlanSummary } from './PlanSummary';
import { DayCard } from './DayCard';
import { PackingList } from './PackingList';
import { ShareExportPanel } from './ShareExportPanel';

type Tab = 'itinerary' | 'packing' | 'share';

export function TripPlanner() {
  const {
    step,
    preferences,
    plan,
    loading,
    error,
    updatePreferences,
    nextStep,
    prevStep,
    generatePlan,
    resetPlanner,
    isFirstStep,
    isLastStep,
    currentStepIndex,
    totalSteps,
    canProceed,
  } = useTripPlanner();

  const [activeTab, setActiveTab] = useState<Tab>('itinerary');

  return (
    <div className="min-h-screen bg-gradient-to-b from-arctic-900 via-arctic-800 to-arctic-900">
      {/* Header */}
      <header className="border-b border-arctic-700 bg-arctic-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">AI Trip Planner</h1>
              <p className="text-sm text-muted-foreground">
                Plan your perfect Tromsø experience
              </p>
            </div>
            {plan && (
              <button
                onClick={resetPlanner}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium',
                  'bg-arctic-700 text-foreground',
                  'hover:bg-arctic-600 transition-colors'
                )}
              >
                New trip plan
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <div className="max-w-3xl mx-auto mb-6">
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-arctic-800 rounded-2xl p-8 border border-arctic-700 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Generating your personalized trip plan...</h3>
              <p className="text-sm text-muted-foreground">
                This usually takes 10-15 seconds
              </p>
            </div>
          </div>
        )}

        {/* Form View (no plan yet) */}
        {!plan && !loading && (
          <TripPreferencesForm
            step={step}
            preferences={preferences}
            onUpdate={updatePreferences}
            onNext={nextStep}
            onPrev={prevStep}
            onSubmit={generatePlan}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            canProceed={canProceed}
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
            loading={loading}
          />
        )}

        {/* Plan View (plan generated) */}
        {plan && !loading && (
          <div className="max-w-6xl mx-auto">
            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('itinerary')}
                className={cn(
                  'px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap',
                  activeTab === 'itinerary'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-arctic-800 text-foreground hover:bg-arctic-700'
                )}
              >
                📅 Itinerary
              </button>
              <button
                onClick={() => setActiveTab('packing')}
                className={cn(
                  'px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap',
                  activeTab === 'packing'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-arctic-800 text-foreground hover:bg-arctic-700'
                )}
              >
                🎒 Packing list
              </button>
              <button
                onClick={() => setActiveTab('share')}
                className={cn(
                  'px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap',
                  activeTab === 'share'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-arctic-800 text-foreground hover:bg-arctic-700'
                )}
              >
                📤 Share & Export
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'itinerary' && (
                <>
                  <PlanSummary plan={plan} />
                  <div className="space-y-6">
                    {plan.days.map((day) => (
                      <DayCard key={day.day} day={day} />
                    ))}
                  </div>
                </>
              )}

              {activeTab === 'packing' && (
                <PackingList
                  items={plan.packingList}
                  planId={`plan-${new Date().getTime()}`}
                />
              )}

              {activeTab === 'share' && (
                <ShareExportPanel plan={plan} />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
