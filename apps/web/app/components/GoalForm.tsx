'use client';

import { useState } from 'react';
import { Goal, useGoals } from '@/app/contexts/GoalsContext';

interface GoalFormProps {
  familyGroupId: string;
  goal?: Goal;
  onSuccess?: (goal: Goal) => void;
  onCancel?: () => void;
}

const CATEGORIES = [
  { value: 'savings', label: '💰 Savings' },
  { value: 'education', label: '🎓 Education' },
  { value: 'home', label: '🏠 Home' },
  { value: 'retirement', label: '🏖️ Retirement' },
  { value: 'investment', label: '📈 Investment' },
  { value: 'other', label: '📋 Other' },
];

export default function GoalForm({
  familyGroupId,
  goal,
  onSuccess,
  onCancel,
}: GoalFormProps) {
  const { createGoal, updateGoal } = useGoals();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: goal?.title || '',
    targetAmount: goal?.targetAmount || '',
    deadline: goal?.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
    category: goal?.category || 'savings',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate inputs
      if (!formData.title.trim()) {
        setError('Goal title is required');
        setLoading(false);
        return;
      }

      const targetAmount = parseFloat(formData.targetAmount as string);
      if (isNaN(targetAmount) || targetAmount <= 0) {
        setError('Target amount must be a positive number');
        setLoading(false);
        return;
      }

      if (!formData.deadline) {
        setError('Deadline is required');
        setLoading(false);
        return;
      }

      const goalData = {
        familyGroupId,
        title: formData.title.trim(),
        targetAmount,
        deadline: new Date(formData.deadline).toISOString(),
        category: formData.category,
        status: (goal?.status || 'active') as 'active' | 'completed' | 'paused',
        progress: goal?.progress || 0,
      };

      let result;
      if (goal) {
        result = await updateGoal(goal.id, goalData);
      } else {
        result = await createGoal(goalData);
      }

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save goal';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">
        {goal ? 'Edit Goal' : 'Create New Goal'}
      </h2>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="text-sm font-medium text-red-800">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Goal Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Save for vacation"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Target Amount ($)
          </label>
          <input
            id="targetAmount"
            name="targetAmount"
            type="number"
            step="0.01"
            min="0"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="10000"
            value={formData.targetAmount}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
            Deadline
          </label>
          <input
            id="deadline"
            name="deadline"
            type="date"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={formData.deadline}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={formData.category}
            onChange={handleChange}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Saving...' : goal ? 'Update Goal' : 'Create Goal'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
