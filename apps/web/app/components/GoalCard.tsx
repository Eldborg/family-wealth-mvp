'use client';

import { Goal } from '@/app/contexts/GoalsContext';
import Link from 'next/link';

interface GoalCardProps {
  goal: Goal;
  familyGroupId: string;
}

export default function GoalCard({ goal, familyGroupId }: GoalCardProps) {
  const daysLeft = Math.ceil(
    (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const isOverdue = daysLeft < 0;
  const isCompleted = goal.status === 'completed';
  const isPaused = goal.status === 'paused';

  const getProgressColor = (): string => {
    if (isCompleted) return 'bg-green-500';
    if (isPaused) return 'bg-gray-500';
    if (goal.progressPercentage >= 100) return 'bg-green-500';
    if (goal.progressPercentage >= 75) return 'bg-blue-500';
    if (goal.progressPercentage >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getStatusColor = (): string => {
    if (isCompleted) return 'bg-green-100 text-green-800';
    if (isPaused) return 'bg-gray-100 text-gray-800';
    if (isOverdue) return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <Link href={`/goals/${goal.id}?familyGroupId=${familyGroupId}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
            <p className="text-sm text-gray-600 mt-1">
              <span className="inline-block bg-gray-100 px-2 py-1 rounded">
                {goal.category}
              </span>
            </p>
          </div>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor()}`}>
            {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              ${goal.progress.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {goal.progressPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getProgressColor()}`}
              style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Deadline and Transactions */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            {isCompleted ? (
              <p className="font-medium text-green-600">✓ Completed</p>
            ) : isPaused ? (
              <p className="font-medium text-gray-600">⏸ Paused</p>
            ) : (
              <p>
                {isOverdue ? (
                  <span className="text-red-600 font-medium">
                    Overdue by {Math.abs(daysLeft)} days
                  </span>
                ) : (
                  <span>{daysLeft} days left</span>
                )}
              </p>
            )}
          </div>
          <div className="text-gray-500">
            {goal.transactionCount || 0} transaction{(goal.transactionCount || 0) !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </Link>
  );
}
