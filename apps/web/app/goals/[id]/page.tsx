'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useGoals } from '@/app/contexts/GoalsContext';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import TransactionForm from '@/app/components/TransactionForm';
import { Goal, Transaction } from '@/app/contexts/GoalsContext';
import Link from 'next/link';

export default function GoalDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { goals, fetchGoals, deleteGoal, deleteTransaction } = useGoals();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const familyGroupId = searchParams.get('familyGroupId') || user?.id || '';

  useEffect(() => {
    const loadGoal = async () => {
      try {
        setLoading(true);
        if (goals.length === 0) {
          await fetchGoals(familyGroupId);
        }
        const found = goals.find((g) => g.id === params.id);
        if (found) {
          setGoal(found);
        } else {
          setError('Goal not found');
        }
      } catch (err) {
        setError('Failed to load goal');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadGoal();
  }, [params.id, familyGroupId, goals, fetchGoals]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteGoal(params.id);
        router.push('/goals');
      } catch (err) {
        setError('Failed to delete goal');
      }
    }
  };

  const handleDeleteTransaction = async (txId: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(params.id, txId);
        // Refresh goal data
        await fetchGoals(familyGroupId);
      } catch (err) {
        setError('Failed to delete transaction');
      }
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Loading goal...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !goal) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Goal not found'}</p>
            <Link href="/goals" className="text-blue-600 hover:text-blue-700 font-medium">
              ← Back to Goals
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const daysLeft = Math.ceil(
    (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const isOverdue = daysLeft < 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/goals" className="text-blue-600 hover:text-blue-700 font-medium mb-6 inline-block">
            ← Back to Goals
          </Link>

          {/* Goal Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{goal.title}</h1>
                <p className="text-gray-600 mt-1">
                  <span className="inline-block bg-gray-100 px-3 py-1 rounded text-sm">
                    {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
                  </span>
                </p>
              </div>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Delete
              </button>
            </div>

            {/* Progress Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-700">Progress</h2>
                <span className="text-2xl font-bold text-gray-900">
                  {goal.progressPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="h-3 rounded-full bg-blue-500 transition-all"
                  style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>${goal.progress.toFixed(2)} saved</span>
                <span>Target: ${goal.targetAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Status and Deadline */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Status</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Deadline</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {isOverdue ? (
                    <span className="text-red-600">
                      Overdue by {Math.abs(daysLeft)} days
                    </span>
                  ) : (
                    <span>{daysLeft} days left</span>
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(goal.deadline).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Add Progress Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <TransactionForm goalId={goal.id} />
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Progress History</h2>

            {goal.transactions && goal.transactions.length > 0 ? (
              <div className="space-y-4">
                {goal.transactions.map((tx: Transaction) => (
                  <div key={tx.id} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        +${tx.amount.toFixed(2)}
                      </p>
                      {tx.description && (
                        <p className="text-sm text-gray-600 mt-1">{tx.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(tx.date).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteTransaction(tx.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium ml-4"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">
                No progress recorded yet. Add a transaction above to get started!
              </p>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
