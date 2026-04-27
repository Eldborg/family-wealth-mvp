'use client';

import { useState } from 'react';

interface GoalFormProps {
  onSubmit: (data: { title: string; targetAmount: number; deadline: string; category: string }) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export default function GoalForm({ onSubmit, loading, error }: GoalFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
    category: 'savings',
  });
  const [localError, setLocalError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.title || !formData.targetAmount || !formData.deadline) {
      setLocalError('All fields are required');
      return;
    }

    try {
      await onSubmit({
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
      });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to create goal');
    }
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg shadow p-6">
      {displayError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm font-medium text-red-800">{displayError}</div>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Goal Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
          placeholder="e.g., House Down Payment"
          value={formData.title}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700">
          Target Amount ($)
        </label>
        <input
          id="targetAmount"
          name="targetAmount"
          type="number"
          required
          step="0.01"
          min="0"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
          placeholder="50000"
          value={formData.targetAmount}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
          Deadline
        </label>
        <input
          id="deadline"
          name="deadline"
          type="date"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
          value={formData.deadline}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="category"
          name="category"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="savings">Savings</option>
          <option value="education">Education</option>
          <option value="home">Home</option>
          <option value="investment">Investment</option>
          <option value="vacation">Vacation</option>
          <option value="other">Other</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating...' : 'Create Goal'}
      </button>
    </form>
  );
}
