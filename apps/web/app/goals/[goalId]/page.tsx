'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/app/components/ProtectedRoute';

interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  progressPercentage: number;
  daysRemaining: number;
  onTrack: boolean;
  category: string;
  status: string;
  transactionSum: number;
}

interface Transaction {
  id: string;
  amount: number;
  description?: string;
  date: string;
}

function GoalDetailContent() {
  const params = useParams();
  const goalId = params.goalId as string;

  const [goal, setGoal] = useState<Goal | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionDescription, setTransactionDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const [goalRes, txRes] = await Promise.all([
          fetch(`${API_URL}/api/goals/${goalId}`, { credentials: 'include' }),
          fetch(`${API_URL}/api/goals/${goalId}/transactions`, { credentials: 'include' }),
        ]);

        if (!goalRes.ok || !txRes.ok) {
          throw new Error('Failed to fetch goal');
        }

        const goalData = await goalRes.json();
        const txData = await txRes.json();

        setGoal(goalData.goal);
        setTransactions(txData.transactions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load goal');
      } finally {
        setLoading(false);
      }
    };

    fetchGoal();
  }, [goalId, API_URL]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/goals/${goalId}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: parseFloat(transactionAmount),
          description: transactionDescription || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add transaction');
      }

      const data = await response.json();
      setTransactions((prev) => [data.transaction, ...prev]);
      setTransactionAmount('');
      setTransactionDescription('');
      setShowAddTransaction(false);

      const goalRes = await fetch(`${API_URL}/api/goals/${goalId}`, { credentials: 'include' });
      const goalData = await goalRes.json();
      setGoal(goalData.goal);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Goal not found</p>
        <Link href="/goals" className="text-blue-600 hover:text-blue-800">
          Back to Goals
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/goals" className="text-blue-600 hover:text-blue-800 mb-6 block">
        ← Back to Goals
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{goal.title}</h1>
        <p className="text-gray-600 capitalize mt-1">{goal.category} · {goal.progressPercentage.toFixed(0)}% complete</p>

        {error && (
          <div className="rounded-md bg-red-50 p-4 my-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 my-6">
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-gray-600 text-sm">Target</p>
            <p className="text-2xl font-bold">${goal.targetAmount.toFixed(0)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <p className="text-gray-600 text-sm">Saved</p>
            <p className="text-2xl font-bold">${goal.transactionSum.toFixed(0)}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <p className="text-gray-600 text-sm">Days Left</p>
            <p className="text-2xl font-bold">{goal.daysRemaining}</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Progress</span>
            <span>{goal.progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="h-3 rounded-full bg-blue-600" style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Contributions</h2>
          <button
            onClick={() => setShowAddTransaction(!showAddTransaction)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {showAddTransaction ? 'Cancel' : 'Add'}
          </button>
        </div>

        {showAddTransaction && (
          <form onSubmit={handleAddTransaction} className="bg-gray-50 p-4 rounded mb-6 space-y-4">
            <input
              type="number"
              step="0.01"
              required
              className="w-full px-3 py-2 border rounded"
              placeholder="Amount"
              value={transactionAmount}
              onChange={(e) => setTransactionAmount(e.target.value)}
            />
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              placeholder="Description (optional)"
              value={transactionDescription}
              onChange={(e) => setTransactionDescription(e.target.value)}
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Save'}
            </button>
          </form>
        )}

        {transactions.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No contributions yet</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex justify-between p-3 border-b">
                <div>
                  <p className="font-medium">${tx.amount.toFixed(2)}</p>
                  {tx.description && <p className="text-sm text-gray-600">{tx.description}</p>}
                </div>
                <p className="text-sm text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GoalDetailPage() {
  return (
    <ProtectedRoute>
      <GoalDetailContent />
    </ProtectedRoute>
  );
}
