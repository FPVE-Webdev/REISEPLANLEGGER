import { TripPlanner } from '@/components/tripplan/TripPlanner';

export const metadata = {
  title: 'Trip Planner - Tromsø',
  description: 'AI-powered trip planning for Tromsø, Norway',
};

export default function PlannerPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Plan Your Tromsø Adventure
          </h1>
          <p className="text-lg text-slate-300">
            AI-powered itinerary generator for Arctic experiences
          </p>
        </div>
        <TripPlanner />
      </div>
    </main>
  );
}
