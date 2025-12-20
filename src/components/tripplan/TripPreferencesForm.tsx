'use client';

import { cn } from '@/lib/utils';
import type { FormStep, TripPreferences, Interest } from '@/types/trip';
import {
  AVAILABLE_INTERESTS,
  INTEREST_METADATA,
  BUDGET_METADATA,
  DIFFICULTY_METADATA,
  TRANSPORT_METADATA,
} from '@/types/trip';

interface TripPreferencesFormProps {
  step: FormStep;
  preferences: Partial<TripPreferences>;
  onUpdate: (updates: Partial<TripPreferences>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  canProceed: boolean;
  currentStepIndex: number;
  totalSteps: number;
  loading: boolean;
}

export function TripPreferencesForm({
  step,
  preferences,
  onUpdate,
  onNext,
  onPrev,
  onSubmit,
  isFirstStep,
  isLastStep,
  canProceed,
  currentStepIndex,
  totalSteps,
  loading,
}: TripPreferencesFormProps) {
  const handleInterestToggle = (interest: Interest) => {
    const current = preferences.interests || [];
    const updated = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest];
    onUpdate({ interests: updated });
  };

  const handleSubmitClick = () => {
    if (canProceed && !loading) {
      onSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">
            Steg {currentStepIndex + 1} av {totalSteps}
          </p>
          <p className="text-sm text-primary font-medium">
            {step === 'basic' && 'Grunnleggende'}
            {step === 'interests' && 'Interesser'}
            {step === 'details' && 'Detaljer'}
          </p>
        </div>
        <div className="w-full bg-arctic-700 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-arctic-800 rounded-2xl p-6 md:p-8 border border-arctic-700">
        {step === 'basic' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">La oss planlegge turen din!</h2>
              <p className="text-muted-foreground">
                Fortell oss litt om reisen du ønsker å planlegge
              </p>
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                Startdato (valgfritt)
              </label>
              <input
                type="date"
                id="startDate"
                value={preferences.startDate || ''}
                onChange={(e) => onUpdate({ startDate: e.target.value })}
                className={cn(
                  'w-full px-4 py-3 rounded-xl',
                  'bg-arctic-700 border border-arctic-700',
                  'text-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-primary'
                )}
              />
            </div>

            {/* Number of Days */}
            <div>
              <label htmlFor="days" className="block text-sm font-medium mb-2">
                Antall dager: {preferences.days || 3}
              </label>
              <input
                type="range"
                id="days"
                min="1"
                max="14"
                value={preferences.days || 3}
                onChange={(e) => onUpdate({ days: parseInt(e.target.value) })}
                className="w-full h-2 bg-arctic-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1 dag</span>
                <span>14 dager</span>
              </div>
            </div>

            {/* Group Size */}
            <div>
              <label htmlFor="groupSize" className="block text-sm font-medium mb-2">
                Antall personer
              </label>
              <input
                type="number"
                id="groupSize"
                min="1"
                max="20"
                value={preferences.groupSize || 2}
                onChange={(e) => onUpdate({ groupSize: parseInt(e.target.value) })}
                className={cn(
                  'w-full px-4 py-3 rounded-xl',
                  'bg-arctic-700 border border-arctic-700',
                  'text-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-primary'
                )}
              />
            </div>
          </div>
        )}

        {step === 'interests' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Hva interesserer deg?</h2>
              <p className="text-muted-foreground">Velg minst én interesse (kan velge flere)</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {AVAILABLE_INTERESTS.map((interest) => {
                const meta = INTEREST_METADATA[interest];
                const isSelected = preferences.interests?.includes(interest) || false;

                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all',
                      'flex flex-col items-center gap-2',
                      'hover:border-primary/50',
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-arctic-700 bg-arctic-700/50'
                    )}
                  >
                    <span className="text-4xl">{meta.emoji}</span>
                    <span className="text-sm font-medium text-center">{meta.label}</span>
                  </button>
                );
              })}
            </div>

            {preferences.interests && preferences.interests.length > 0 && (
              <p className="text-sm text-primary text-center">
                ✓ {preferences.interests.length} interesse{preferences.interests.length > 1 ? 'r' : ''} valgt
              </p>
            )}
          </div>
        )}

        {step === 'details' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Siste detaljer</h2>
              <p className="text-muted-foreground">Tilpass turen til dine behov</p>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium mb-3">Budsjett per dag</label>
              <div className="space-y-2">
                {(Object.keys(BUDGET_METADATA) as Array<keyof typeof BUDGET_METADATA>).map((level) => {
                  const meta = BUDGET_METADATA[level];
                  const isSelected = preferences.budget === level;

                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => onUpdate({ budget: level })}
                      className={cn(
                        'w-full p-4 rounded-xl border-2 transition-all',
                        'flex items-center justify-between',
                        'hover:border-primary/50',
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-arctic-700 bg-arctic-700/50'
                      )}
                    >
                      <div className="text-left">
                        <div className="font-medium">{meta.label}</div>
                        <div className="text-sm text-muted-foreground">{meta.description}</div>
                      </div>
                      <div className="text-sm font-medium text-primary">{meta.amount}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Transport */}
            <div>
              <label className="block text-sm font-medium mb-3">Transport</label>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(TRANSPORT_METADATA) as Array<keyof typeof TRANSPORT_METADATA>).map((mode) => {
                  const meta = TRANSPORT_METADATA[mode];
                  const isSelected = preferences.transport === mode;

                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => onUpdate({ transport: mode })}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all',
                        'hover:border-primary/50',
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-arctic-700 bg-arctic-700/50'
                      )}
                    >
                      <div className="font-medium mb-1">{meta.label}</div>
                      <div className="text-sm text-muted-foreground">{meta.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium mb-3">Aktivitetsnivå</label>
              <div className="space-y-2">
                {(Object.keys(DIFFICULTY_METADATA) as Array<keyof typeof DIFFICULTY_METADATA>).map(
                  (level) => {
                    const meta = DIFFICULTY_METADATA[level];
                    const isSelected = preferences.difficulty === level;

                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => onUpdate({ difficulty: level })}
                        className={cn(
                          'w-full p-4 rounded-xl border-2 transition-all',
                          'text-left',
                          'hover:border-primary/50',
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-arctic-700 bg-arctic-700/50'
                        )}
                      >
                        <div className="font-medium mb-1">{meta.label}</div>
                        <div className="text-sm text-muted-foreground">{meta.description}</div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-6">
        {!isFirstStep && (
          <button
            type="button"
            onClick={onPrev}
            disabled={loading}
            className={cn(
              'px-6 py-3 rounded-xl font-medium',
              'bg-arctic-700 text-foreground',
              'hover:bg-arctic-600 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            Tilbake
          </button>
        )}
        {!isLastStep ? (
          <button
            type="button"
            onClick={onNext}
            disabled={!canProceed || loading}
            className={cn(
              'flex-1 px-6 py-3 rounded-xl font-medium',
              'bg-primary text-primary-foreground',
              'hover:bg-primary/90 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            Neste
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmitClick}
            disabled={!canProceed || loading}
            className={cn(
              'flex-1 px-6 py-3 rounded-xl font-medium',
              'bg-primary text-primary-foreground',
              'hover:bg-primary/90 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center justify-center gap-2'
            )}
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Genererer turplan...
              </>
            ) : (
              'Generer turplan'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
