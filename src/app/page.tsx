import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <span className="text-slate-950 font-bold">T</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">Tripplan Tromsø</h1>
              <p className="text-xs text-slate-400">AI-powered Arctic adventures</p>
            </div>
          </div>
          <Link 
            href="https://tromso.ai"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← Back to Tromsø.AI
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Plan Your Perfect
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Arctic Adventure
              </span>
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
            AI-powered trip planning for Tromsø, Norway. Get personalized itineraries 
            based on weather, interests, and Arctic conditions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/planner"
              className="px-8 py-4 bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-bold rounded-2xl hover:scale-105 transition-transform text-lg"
            >
              Start Planning →
            </Link>
            <Link
              href="https://tromso.ai"
              className="px-8 py-4 border border-slate-600 text-white hover:border-emerald-400 rounded-2xl transition-colors text-lg"
            >
              Explore Tromsø.AI
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌌</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Season-Aware</h3>
              <p className="text-sm text-slate-400">Optimized for Northern Lights, Midnight Sun, and Arctic conditions</p>
            </div>
            
            <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
              <p className="text-sm text-slate-400">Smart recommendations based on weather, interests, and travel style</p>
            </div>
            
            <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Export Ready</h3>
              <p className="text-sm text-slate-400">Download PDF itineraries or add to your calendar instantly</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
