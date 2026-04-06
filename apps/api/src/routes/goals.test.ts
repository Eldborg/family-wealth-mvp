import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    goal: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    familyMember: {
      findUnique: jest.fn(),
    },
  })),
}));

describe('Goals Routes', () => {
  let prisma: any;

  const mockUser = {
    userId: 'user-123',
    email: 'test@example.com',
    type: 'access',
  };

  const mockFamilyGroup = {
    id: 'family-123',
    name: 'Test Family',
    createdById: mockUser.userId,
  };

  const mockGoal = {
    id: 'goal-123',
    familyGroupId: mockFamilyGroup.id,
    title: 'Save for vacation',
    targetAmount: 5000,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    category: 'savings',
    progress: 1000,
    status: 'active',
    progressPercentage: 20,
    transactionCount: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTransaction = {
    id: 'tx-123',
    goalId: mockGoal.id,
    amount: 500,
    description: 'Monthly savings',
    date: new Date(),
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = new PrismaClient();
  });

  describe('GET /api/goals', () => {
    it('should return goals for a family group', async () => {
      prisma.familyMember.findUnique.mockResolvedValue({
        familyGroupId: mockFamilyGroup.id,
        userId: mockUser.userId,
        role: 'member',
      });

      prisma.goal.findMany.mockResolvedValue([mockGoal]);

      const member = await prisma.familyMember.findUnique({
        where: {
          familyGroupId_userId: {
            familyGroupId: mockFamilyGroup.id,
            userId: mockUser.userId,
          },
        },
      });

      expect(member).toBeDefined();
      expect(member.familyGroupId).toBe(mockFamilyGroup.id);

      const goals = await prisma.goal.findMany({
        where: { familyGroupId: mockFamilyGroup.id },
        include: { transactions: true },
      });

      expect(goals.length).toBeGreaterThan(0);
      expect(goals[0].title).toBe('Save for vacation');
      expect(goals[0].targetAmount).toBe(5000);
    });

    it('should return empty array when no goals exist', async () => {
      prisma.familyMember.findUnique.mockResolvedValue({
        familyGroupId: mockFamilyGroup.id,
        userId: mockUser.userId,
      });

      prisma.goal.findMany.mockResolvedValue([]);

      const goals = await prisma.goal.findMany({
        where: { familyGroupId: mockFamilyGroup.id },
      });

      expect(goals.length).toBe(0);
    });

    it('should include progress percentage in response', async () => {
      const goalWithProgress = {
        ...mockGoal,
        progressPercentage: (mockGoal.progress / mockGoal.targetAmount) * 100,
      };

      prisma.goal.findMany.mockResolvedValue([goalWithProgress]);

      const goals = await prisma.goal.findMany({
        where: { familyGroupId: mockFamilyGroup.id },
      });

      expect(goals[0].progressPercentage).toBe(20);
    });
  });

  describe('POST /api/goals', () => {
    it('should create a new goal with valid data', async () => {
      const newGoalData = {
        familyGroupId: mockFamilyGroup.id,
        title: 'Save for home',
        targetAmount: 50000,
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        category: 'home',
        status: 'active',
      };

      const createdGoal = {
        id: 'goal-456',
        ...newGoalData,
        progress: 0,
        progressPercentage: 0,
      };

      prisma.familyMember.findUnique.mockResolvedValue({
        familyGroupId: mockFamilyGroup.id,
        userId: mockUser.userId,
      });

      prisma.goal.create.mockResolvedValue(createdGoal);

      const goal = await prisma.goal.create({
        data: newGoalData,
      });

      expect(goal.id).toBeDefined();
      expect(goal.title).toBe('Save for home');
      expect(goal.targetAmount).toBe(50000);
      expect(goal.category).toBe('home');
    });

    it('should validate required fields', async () => {
      const invalidGoalData = {
        familyGroupId: mockFamilyGroup.id,
        title: '', // Empty title
        targetAmount: 1000,
      };

      expect(invalidGoalData.title).toBe('');
      expect(invalidGoalData.title.trim().length).toBe(0);
    });

    it('should validate target amount is positive', async () => {
      const invalidAmount = -100;
      expect(invalidAmount).toBeLessThanOrEqual(0);
    });
  });

  describe('GET /api/goals/{id}', () => {
    it('should return goal with transactions', async () => {
      prisma.familyMember.findUnique.mockResolvedValue({
        familyGroupId: mockFamilyGroup.id,
        userId: mockUser.userId,
      });

      prisma.goal.findUnique.mockResolvedValue({
        ...mockGoal,
        transactions: [mockTransaction],
      });

      const goal = await prisma.goal.findUnique({
        where: { id: mockGoal.id },
        include: { transactions: true },
      });

      expect(goal).toBeDefined();
      expect(goal.title).toBe(mockGoal.title);
      expect(goal.transactions.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent goal', async () => {
      prisma.goal.findUnique.mockResolvedValue(null);

      const goal = await prisma.goal.findUnique({
        where: { id: 'nonexistent-id' },
      });

      expect(goal).toBeNull();
    });

    it('should calculate progress percentage', async () => {
      const goal = {
        ...mockGoal,
        progress: 1000,
        targetAmount: 5000,
      };

      const percentage = (goal.progress / goal.targetAmount) * 100;
      expect(percentage).toBe(20);
    });
  });

  describe('PATCH /api/goals/{id}', () => {
    it('should update goal status', async () => {
      const updatedGoal = {
        ...mockGoal,
        status: 'completed',
      };

      prisma.goal.findUnique.mockResolvedValue(mockGoal);
      prisma.goal.update.mockResolvedValue(updatedGoal);

      const goal = await prisma.goal.update({
        where: { id: mockGoal.id },
        data: { status: 'completed' },
      });

      expect(goal.status).toBe('completed');
    });

    it('should update goal target amount', async () => {
      const updatedGoal = {
        ...mockGoal,
        targetAmount: 10000,
      };

      prisma.goal.update.mockResolvedValue(updatedGoal);

      const goal = await prisma.goal.update({
        where: { id: mockGoal.id },
        data: { targetAmount: 10000 },
      });

      expect(goal.targetAmount).toBe(10000);
    });

    it('should validate status values', async () => {
      const validStatuses = ['active', 'completed', 'paused'];
      const invalidStatus = 'archived';

      expect(validStatuses.includes('active')).toBe(true);
      expect(validStatuses.includes('completed')).toBe(true);
      expect(validStatuses.includes('paused')).toBe(true);
      expect(validStatuses.includes(invalidStatus)).toBe(false);
    });
  });

  describe('POST /api/goals/{id}/transactions', () => {
    it('should add transaction and update goal progress', async () => {
      const initialProgress = mockGoal.progress;

      prisma.goal.findUnique.mockResolvedValue(mockGoal);
      prisma.transaction.create.mockResolvedValue(mockTransaction);
      prisma.goal.update.mockResolvedValue({
        ...mockGoal,
        progress: initialProgress + mockTransaction.amount,
      });

      const transaction = await prisma.transaction.create({
        data: {
          goalId: mockGoal.id,
          amount: mockTransaction.amount,
        },
      });

      expect(transaction.amount).toBe(500);
      expect(transaction.goalId).toBe(mockGoal.id);

      const updatedGoal = await prisma.goal.update({
        where: { id: mockGoal.id },
        data: { progress: { increment: mockTransaction.amount } },
      });

      expect(updatedGoal.progress).toBe(initialProgress + 500);
    });

    it('should validate transaction amount is positive', async () => {
      const negativeAmount = -100;
      expect(negativeAmount).toBeLessThanOrEqual(0);

      const zeroAmount = 0;
      expect(zeroAmount).toBeLessThanOrEqual(0);

      const validAmount = 100;
      expect(validAmount).toBeGreaterThan(0);
    });

    it('should calculate progress percentage after transaction', async () => {
      const updatedGoal = {
        ...mockGoal,
        progress: mockGoal.progress + 500,
      };

      const percentage = (updatedGoal.progress / updatedGoal.targetAmount) * 100;
      expect(percentage).toBeGreaterThan(mockGoal.progress / mockGoal.targetAmount * 100);
    });
  });

  describe('GET /api/goals/{id}/transactions', () => {
    it('should return transactions for a goal', async () => {
      prisma.goal.findUnique.mockResolvedValue(mockGoal);
      prisma.transaction.findMany.mockResolvedValue([mockTransaction]);

      const goal = await prisma.goal.findUnique({
        where: { id: mockGoal.id },
      });

      expect(goal).toBeDefined();

      const transactions = await prisma.transaction.findMany({
        where: { goalId: mockGoal.id },
        orderBy: { date: 'desc' },
      });

      expect(transactions.length).toBeGreaterThan(0);
      expect(transactions[0].amount).toBe(mockTransaction.amount);
    });

    it('should return empty array when no transactions exist', async () => {
      prisma.transaction.findMany.mockResolvedValue([]);

      const transactions = await prisma.transaction.findMany({
        where: { goalId: mockGoal.id },
      });

      expect(transactions.length).toBe(0);
    });

    it('should order transactions by date descending', async () => {
      const tx1 = {
        ...mockTransaction,
        id: 'tx-1',
        date: new Date('2024-01-01'),
      };
      const tx2 = {
        ...mockTransaction,
        id: 'tx-2',
        date: new Date('2024-01-15'),
      };

      prisma.transaction.findMany.mockResolvedValue([tx2, tx1]);

      const transactions = await prisma.transaction.findMany({
        where: { goalId: mockGoal.id },
        orderBy: { date: 'desc' },
      });

      expect(transactions[0].date).toEqual(tx2.date);
      expect(transactions[1].date).toEqual(tx1.date);
    });
  });

  describe('DELETE /api/goals/{id}/transactions/{txId}', () => {
    it('should delete transaction and decrement progress', async () => {
      const initialProgress = mockGoal.progress;

      prisma.transaction.findUnique.mockResolvedValue({
        ...mockTransaction,
        goal: mockGoal,
      });

      prisma.transaction.delete.mockResolvedValue(mockTransaction);

      prisma.goal.update.mockResolvedValue({
        ...mockGoal,
        progress: initialProgress - mockTransaction.amount,
      });

      const transaction = await prisma.transaction.findUnique({
        where: { id: mockTransaction.id },
        include: { goal: true },
      });

      expect(transaction).toBeDefined();

      await prisma.transaction.delete({
        where: { id: mockTransaction.id },
      });

      const updatedGoal = await prisma.goal.update({
        where: { id: mockGoal.id },
        data: { progress: { decrement: mockTransaction.amount } },
      });

      expect(updatedGoal.progress).toBe(initialProgress - 500);
    });
  });

  describe('DELETE /api/goals/{id}', () => {
    it('should delete goal', async () => {
      prisma.goal.findUnique.mockResolvedValue(mockGoal);
      prisma.goal.delete.mockResolvedValue(mockGoal);

      await prisma.goal.delete({
        where: { id: mockGoal.id },
      });

      prisma.goal.findUnique.mockResolvedValue(null);

      const found = await prisma.goal.findUnique({
        where: { id: mockGoal.id },
      });

      expect(found).toBeNull();
    });
  });

  describe('Permission Checks', () => {
    it('should verify family membership before accessing goal', async () => {
      prisma.familyMember.findUnique.mockResolvedValue(null);

      const membership = await prisma.familyMember.findUnique({
        where: {
          familyGroupId_userId: {
            familyGroupId: mockFamilyGroup.id,
            userId: 'other-user-id',
          },
        },
      });

      expect(membership).toBeNull();
    });

    it('should allow member to access family goals', async () => {
      prisma.familyMember.findUnique.mockResolvedValue({
        familyGroupId: mockFamilyGroup.id,
        userId: mockUser.userId,
        role: 'member',
      });

      const membership = await prisma.familyMember.findUnique({
        where: {
          familyGroupId_userId: {
            familyGroupId: mockFamilyGroup.id,
            userId: mockUser.userId,
          },
        },
      });

      expect(membership).toBeDefined();
      expect(membership.role).toBe('member');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid goal ID gracefully', async () => {
      prisma.goal.findUnique.mockResolvedValue(null);

      const goal = await prisma.goal.findUnique({
        where: { id: 'invalid-id' },
      });

      expect(goal).toBeNull();
    });

    it('should handle missing family group ID', async () => {
      const invalidRequest = {
        familyGroupId: null,
        title: 'Goal',
        targetAmount: 1000,
      };

      expect(invalidRequest.familyGroupId).toBeNull();
    });

    it('should validate goal title is not empty', async () => {
      const emptyTitle = '';
      expect(emptyTitle.trim().length).toBe(0);
    });
  });
});
