'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import GoalCard from '@/app/components/GoalCard';
import GoalForm from '@/app/components/GoalForm';
import FeedbackForm from '@/app/components/FeedbackForm';
import { analytics } from '@/app/lib/analytics';

interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  progressPercentage: number;
  daysRemaining: number;
  onTrack: boolean;
  category: string;
}

function GoalsContent() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [familyGroupId, setFamilyGroupId] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Fetch goals on mount
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetch(`${API_URL}/api/goals`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch goals');
        }

        const data = await response.json();
        setFamilyGroupId(data.familyGroupId);
        setGoals(data.goals);
        analytics.trackPageView('/goals', { goalCount: data.goals.length });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load goals';
        setError(errorMsg);
        analytics.trackError(errorMsg, { context: 'fetchGoals' });
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [API_URL]);

  const handleCreateGoal = async (formData: { title: string; targetAmount: number; deadline: string; category: string }) => {
    setFormLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          familyGroupId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create goal');
      }

      const data = await response.json();
      setGoals((prev) => [...prev, data.goal]);
      setShowForm(false);
      analytics.trackFeatureUsage('goal_created', {
        category: formData.category,
        targetAmount: formData.targetAmount,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create goal';
      setError(errorMsg);
      analytics.trackError(errorMsg, { context: 'createGoal' });
      throw err;
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Loading goals...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Family Wealth Goals</h2>
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
          ← Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="text-sm font-medium text-red-800">{error}</div>
        </div>
      )}

      <div className="flex gap-4 mb-8">
        {!showForm ? (
          <button
            onClick={() => {
              setShowForm(true);
              analytics.trackUserAction('clicked_create_goal');
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Create New Goal
          </button>
        ) : (
          <div className="mb-8">
            <GoalForm onSubmit={handleCreateGoal} loading={formLoading} error={error} />
            <button
              onClick={() => setShowForm(false)}
              className="mt-4 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        )}
        <button
          onClick={() => {
            setShowFeedback(true);
            analytics.trackUserAction('clicked_feedback_button');
          }}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 h-fit"
        >
          Send Feedback
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No goals yet. Create your first family wealth goal!</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              id={goal.id}
              title={goal.title}
              targetAmount={goal.targetAmount}
              progressPercentage={goal.progressPercentage}
              daysRemaining={goal.daysRemaining}
              onTrack={goal.onTrack}
              category={goal.category}
            />
          ))}
        </div>
      )}

      {showFeedback && <FeedbackForm onClose={() => setShowFeedback(false)} />}
    </div>
  );
}

export default function GoalsPage() {
  return (
    <ProtectedRoute>
      <GoalsContent />
    </ProtectedRoute>
  );
}
