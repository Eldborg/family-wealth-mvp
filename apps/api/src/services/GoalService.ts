import { PrismaClient, Goal, Transaction } from '@prisma/client';

export interface CreateGoalInput {
  familyGroupId: string;
  title: string;
  targetAmount: number;
  deadline: Date;
  category: string;
}

export interface UpdateGoalInput {
  title?: string;
  targetAmount?: number;
  deadline?: Date;
  category?: string;
  status?: string;
}

export interface GoalWithProgress extends Goal {
  transactionSum: number;
  progressPercentage: number;
  daysRemaining: number;
  onTrack: boolean;
}

export class GoalService {
  constructor(private prisma: PrismaClient = new PrismaClient()) {}

  async createGoal(input: CreateGoalInput): Promise<Goal> {
    return this.prisma.goal.create({
      data: {
        familyGroupId: input.familyGroupId,
        title: input.title,
        targetAmount: input.targetAmount,
        deadline: input.deadline,
        category: input.category,
      },
    });
  }

  async getGoal(goalId: string): Promise<GoalWithProgress | null> {
    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
      include: { transactions: true },
    });

    if (!goal) return null;

    const transactionSum = goal.transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const progressPercentage = Math.min((transactionSum / goal.targetAmount) * 100, 100);
    const daysRemaining = Math.max(0, Math.ceil((goal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    const onTrack = this.isOnTrack(transactionSum, goal.targetAmount, daysRemaining, goal.deadline);

    return {
      ...goal,
      transactionSum,
      progressPercentage,
      daysRemaining,
      onTrack,
    };
  }

  async getGoalsByFamily(familyGroupId: string): Promise<GoalWithProgress[]> {
    const goals = await this.prisma.goal.findMany({
      where: { familyGroupId },
      include: { transactions: true },
      orderBy: { deadline: 'asc' },
    });

    return goals.map((goal) => {
      const transactionSum = goal.transactions.reduce((sum, tx) => sum + tx.amount, 0);
      const progressPercentage = Math.min((transactionSum / goal.targetAmount) * 100, 100);
      const daysRemaining = Math.max(0, Math.ceil((goal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      const onTrack = this.isOnTrack(transactionSum, goal.targetAmount, daysRemaining, goal.deadline);

      return {
        ...goal,
        transactionSum,
        progressPercentage,
        daysRemaining,
        onTrack,
      };
    });
  }

  async updateGoal(goalId: string, input: UpdateGoalInput): Promise<Goal> {
    return this.prisma.goal.update({
      where: { id: goalId },
      data: input,
    });
  }

  async deleteGoal(goalId: string): Promise<Goal> {
    return this.prisma.goal.delete({
      where: { id: goalId },
    });
  }

  async addTransaction(goalId: string, amount: number, description?: string): Promise<Transaction> {
    return this.prisma.transaction.create({
      data: {
        goalId,
        amount,
        description,
      },
    });
  }

  async getGoalTransactions(goalId: string): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: { goalId },
      orderBy: { date: 'desc' },
    });
  }

  async deleteTransaction(transactionId: string): Promise<Transaction> {
    return this.prisma.transaction.delete({
      where: { id: transactionId },
    });
  }

  async getOrCreateUserFamilyGroup(userId: string, userName: string): Promise<string> {
    // Check if user is already in a family group
    const membership = await this.prisma.familyMember.findFirst({
      where: { userId },
      include: { familyGroup: true },
    });

    if (membership) {
      return membership.familyGroupId;
    }

    // Create a new family group for the user
    const familyGroup = await this.prisma.familyGroup.create({
      data: {
        name: `${userName}'s Family`,
        createdById: userId,
        members: {
          create: {
            userId,
            role: 'owner',
          },
        },
      },
    });

    return familyGroup.id;
  }

  private isOnTrack(current: number, target: number, daysRemaining: number, deadline: Date): boolean {
    if (daysRemaining === 0) {
      return current >= target;
    }

    // Calculate daily required amount
    const totalDays = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const dailyRequired = target / totalDays;
    const currentDaily = current / (totalDays - daysRemaining || 1);

    return currentDaily >= dailyRequired;
  }
}

export const goalService = new GoalService();
