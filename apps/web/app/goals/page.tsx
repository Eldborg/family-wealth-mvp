'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useGoals } from '@/app/contexts/GoalsContext';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import GoalCard from '@/app/components/GoalCard';
import GoalForm from '@/app/components/GoalForm';

export default function GoalsPage() {
  const { user } = useAuth();
  const { goals, loading, error, fetchGoals, clearError } = useGoals();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [familyGroupId] = useState(user?.id || ''); // In a real app, this would come from family group selection

  useEffect(() => {
    if (familyGroupId) {
      fetchGoals(familyGroupId);
    }
  }, [familyGroupId, fetchGoals]);

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Family Goals</h1>
              <p className="text-gray-600 mt-2">Track your family's financial goals together</p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition"
            >
              {showCreateForm ? 'Cancel' : '+ New Goal'}
            </button>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <div className="mb-8">
              <GoalForm
                familyGroupId={familyGroupId}
                onSuccess={handleCreateSuccess}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-red-800">{error}</div>
                <button
                  onClick={clearError}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading your goals...</p>
            </div>
          )}

          {/* Goals Grid */}
          {!loading && goals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  familyGroupId={familyGroupId}
                />
              ))}
            </div>
          ) : !loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No goals yet. Create one to get started!</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition"
              >
                Create Your First Goal
              </button>
            </div>
          ) : null}

          {/* Stats */}
          {!loading && goals.length > 0 && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-gray-600 text-sm font-medium">Total Goals</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{goals.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-gray-600 text-sm font-medium">Active Goals</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {goals.filter((g) => g.status === 'active').length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-gray-600 text-sm font-medium">Total Target Amount</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${goals.reduce((sum, g) => sum + g.targetAmount, 0).toFixed(0)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
