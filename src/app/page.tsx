export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="text-center px-4">
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-blue-600 mb-4">
            Coming Soon
          </h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
        </div>

        <p className="text-xl md:text-2xl text-gray-700 mb-4">
          Tripplan Tromsø
        </p>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          We're working on something exciting. Stay tuned!
        </p>
      </div>
    </main>
  );
}
