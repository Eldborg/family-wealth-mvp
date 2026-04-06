'use client';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Welcome to Family Wealth</h2>
      <p className="text-lg text-gray-600 mb-6">
        Collaborate with your family to achieve financial goals together.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-xl font-semibold mb-2">Set Goals</h3>
          <p className="text-gray-600">Define shared financial goals for your family.</p>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
          <p className="text-gray-600">Monitor progress towards your financial objectives.</p>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <h3 className="text-xl font-semibold mb-2">Collaborate</h3>
          <p className="text-gray-600">Work together as a family to achieve success.</p>
        </div>
      </div>

      <div className="mt-8">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
          Get Started
        </button>
      </div>
    </div>
  );
}
