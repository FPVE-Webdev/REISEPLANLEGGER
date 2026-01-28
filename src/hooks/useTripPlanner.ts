import { useState, useCallback } from 'react';
import type {
  FormStep,
  TripPreferences,
  TripPlan,
  TripPlanResponse,
  TripPlannerState,
} from '@/types/trip';

const FORM_STEPS: FormStep[] = ['basic', 'interests', 'details'];

const DEFAULT_PREFERENCES: Partial<TripPreferences> = {
  days: 3,
  groupSize: 2,
  budget: 'medium',
  interests: [],
  transport: 'car',
  difficulty: 'moderate',
  language: 'no',
};

export function useTripPlanner() {
  const [state, setState] = useState<TripPlannerState>({
    step: 'basic',
    preferences: DEFAULT_PREFERENCES,
    plan: null,
    loading: false,
    error: null,
  });

  const updatePreferences = useCallback((updates: Partial<TripPreferences>) => {
    setState((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, ...updates },
      error: null,
    }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => {
      const currentIndex = FORM_STEPS.indexOf(prev.step);
      if (currentIndex < FORM_STEPS.length - 1) {
        return { ...prev, step: FORM_STEPS[currentIndex + 1], error: null };
      }
      return prev;
    });
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => {
      const currentIndex = FORM_STEPS.indexOf(prev.step);
      if (currentIndex > 0) {
        return { ...prev, step: FORM_STEPS[currentIndex - 1], error: null };
      }
      return prev;
    });
  }, []);

  const validatePreferences = useCallback(
    (prefs: Partial<TripPreferences>): prefs is TripPreferences => {
      if (!prefs.days || prefs.days < 1 || prefs.days > 14) return false;
      if (!prefs.budget) return false;
      if (!prefs.interests || prefs.interests.length === 0) return false;
      if (!prefs.transport) return false;
      if (!prefs.difficulty) return false;
      return true;
    },
    []
  );

  const generatePlan = useCallback(async () => {
    if (!validatePreferences(state.preferences)) {
      setState((prev) => ({
        ...prev,
        error: 'Vennligst fyll ut alle obligatoriske felter',
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: state.preferences,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data: TripPlanResponse = await response.json();

      setState((prev) => ({
        ...prev,
        plan: data.plan,
        loading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Error generating trip plan:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Noe gikk galt ved generering av turplan. Prøv igjen.',
      }));
    }
  }, [state.preferences, validatePreferences]);

  const resetPlanner = useCallback(() => {
    setState({
      step: 'basic',
      preferences: DEFAULT_PREFERENCES,
      plan: null,
      loading: false,
      error: null,
    });
  }, []);

  const goToStep = useCallback((step: FormStep) => {
    setState((prev) => ({ ...prev, step, error: null }));
  }, []);

  return {
    // State
    step: state.step,
    preferences: state.preferences,
    plan: state.plan,
    loading: state.loading,
    error: state.error,

    // Actions
    updatePreferences,
    nextStep,
    prevStep,
    goToStep,
    generatePlan,
    resetPlanner,
    validatePreferences,

    // Computed
    isFirstStep: state.step === FORM_STEPS[0],
    isLastStep: state.step === FORM_STEPS[FORM_STEPS.length - 1],
    currentStepIndex: FORM_STEPS.indexOf(state.step),
    totalSteps: FORM_STEPS.length,
    canProceed: (() => {
      const { step, preferences } = state;
      switch (step) {
        case 'basic':
          return (
            preferences.days !== undefined &&
            preferences.days >= 1 &&
            preferences.days <= 14 &&
            preferences.groupSize !== undefined &&
            preferences.groupSize >= 1
          );
        case 'interests':
          return preferences.interests !== undefined && preferences.interests.length > 0;
        case 'details':
          return (
            preferences.budget !== undefined &&
            preferences.transport !== undefined &&
            preferences.difficulty !== undefined
          );
        default:
          return false;
      }
    })(),
  };
}
