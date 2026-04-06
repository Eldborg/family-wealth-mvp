'use client';

import Link from 'next/link';
import { useAuth } from './contexts/AuthContext';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Welcome to Family Wealth</h2>
        {!loading && (
          <div className="space-x-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>

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

      {!isAuthenticated && !loading && (
        <div className="mt-8 text-center">
          <Link
            href="/auth/register"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block"
          >
            Get Started
          </Link>
        </div>
      )}
    </div>
  );
}
