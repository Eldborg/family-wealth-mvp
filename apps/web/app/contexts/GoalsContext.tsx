'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface Transaction {
  id: string;
  goalId: string;
  amount: number;
  description?: string;
  date: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  familyGroupId: string;
  title: string;
  description?: string;
  targetAmount: number;
  deadline: string;
  category: string;
  progress: number;
  progressPercentage: number;
  status: 'active' | 'completed' | 'paused';
  transactions?: Transaction[];
  transactionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GoalsContextType {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  fetchGoals: (familyGroupId: string) => Promise<void>;
  createGoal: (goal: Omit<Goal, 'id' | 'progress' | 'progressPercentage' | 'createdAt' | 'updatedAt'>) => Promise<Goal>;
  updateGoal: (id: string, goal: Partial<Goal>) => Promise<Goal>;
  deleteGoal: (id: string) => Promise<void>;
  addTransaction: (goalId: string, amount: number, description?: string, date?: string) => Promise<Transaction>;
  deleteTransaction: (goalId: string, txId: string) => Promise<void>;
  clearError: () => void;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export const GoalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchGoals = useCallback(
    async (familyGroupId: string) => {
      if (!isAuthenticated) return;

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/goals?familyGroupId=${familyGroupId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch goals');
        }

        const data = await response.json();
        setGoals(data.goals || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch goals';
        setError(message);
        console.error('Error fetching goals:', err);
      } finally {
        setLoading(false);
      }
    },
    [API_URL, isAuthenticated]
  );

  const createGoal = useCallback(
    async (goalData: Omit<Goal, 'id' | 'progress' | 'progressPercentage' | 'createdAt' | 'updatedAt'>): Promise<Goal> => {
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/goals`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(goalData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create goal');
        }

        const data = await response.json();
        const newGoal = data.goal;
        setGoals((prev) => [newGoal, ...prev]);
        return newGoal;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create goal';
        setError(message);
        throw err;
      }
    },
    [API_URL]
  );

  const updateGoal = useCallback(
    async (id: string, goalData: Partial<Goal>): Promise<Goal> => {
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/goals/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(goalData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update goal');
        }

        const data = await response.json();
        const updatedGoal = data.goal;
        setGoals((prev) => prev.map((g) => (g.id === id ? updatedGoal : g)));
        return updatedGoal;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update goal';
        setError(message);
        throw err;
      }
    },
    [API_URL]
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/goals/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete goal');
        }

        setGoals((prev) => prev.filter((g) => g.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete goal';
        setError(message);
        throw err;
      }
    },
    [API_URL]
  );

  const addTransaction = useCallback(
    async (goalId: string, amount: number, description?: string, date?: string): Promise<Transaction> => {
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/goals/${goalId}/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ amount, description, date }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to add transaction');
        }

        const data = await response.json();
        const transaction = data.transaction;

        // Update goal in local state
        setGoals((prev) =>
          prev.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  progress: data.goal.progress,
                  progressPercentage: data.goal.progressPercentage,
                }
              : g
          )
        );

        return transaction;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add transaction';
        setError(message);
        throw err;
      }
    },
    [API_URL]
  );

  const deleteTransaction = useCallback(
    async (goalId: string, txId: string) => {
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/goals/${goalId}/transactions/${txId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete transaction');
        }

        // Refetch goal to get updated progress
        await fetchGoals(goals[0]?.familyGroupId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete transaction';
        setError(message);
        throw err;
      }
    },
    [API_URL, fetchGoals, goals]
  );

  const clearError = () => setError(null);

  const value: GoalsContextType = {
    goals,
    loading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    addTransaction,
    deleteTransaction,
    clearError,
  };

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>;
};

export const useGoals = (): GoalsContextType => {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
};
