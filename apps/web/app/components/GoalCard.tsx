'use client';

import Link from 'next/link';
import { analytics } from '@/app/lib/analytics';

interface GoalCardProps {
  id: string;
  title: string;
  targetAmount: number;
  progressPercentage: number;
  daysRemaining: number;
  onTrack: boolean;
  category: string;
}

export default function GoalCard({ id, title, targetAmount, progressPercentage, daysRemaining, onTrack, category }: GoalCardProps) {
  const getStatusColor = () => {
    if (daysRemaining === 0) return 'border-red-300 bg-red-50';
    if (!onTrack) return 'border-yellow-300 bg-yellow-50';
    return 'border-green-300 bg-green-50';
  };

  const getProgressColor = () => {
    if (progressPercentage >= 100) return 'bg-green-500';
    if (!onTrack) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <Link
      href={`/goals/${id}`}
      onClick={() => {
        analytics.trackUserAction('viewed_goal_detail', {
          goalId: id,
          onTrack,
          progressPercentage,
        });
      }}
    >
      <div className={`rounded-lg border-2 p-4 cursor-pointer hover:shadow-md transition-shadow ${getStatusColor()}`}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{category}</p>
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded ${daysRemaining === 0 ? 'bg-red-100 text-red-800' : onTrack ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {daysRemaining === 0 ? 'Due' : `${daysRemaining} days`}
          </span>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-700">${(progressPercentage / 100 * targetAmount).toFixed(0)} / ${targetAmount.toFixed(0)}</span>
            <span className="text-gray-600">{progressPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getProgressColor()}`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        <p className="text-xs text-gray-600">
          {onTrack ? '✓ On track' : '⚠ At risk'}
        </p>
      </div>
    </Link>
  );
}
