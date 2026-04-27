import { GoalService } from './GoalService';

describe('GoalService', () => {
  let goalService: GoalService;
  let mockPrisma: any;

  const mockGoal = {
    id: 'goal-1',
    familyGroupId: 'family-1',
    title: 'Save for vacation',
    targetAmount: 5000,
    deadline: new Date('2026-12-31'),
    category: 'vacation',
    progress: 0,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    transactions: [
      { id: 'tx-1', goalId: 'goal-1', amount: 1000, description: 'Monthly savings', date: new Date(), createdAt: new Date() },
      { id: 'tx-2', goalId: 'goal-1', amount: 500, description: 'Bonus', date: new Date(), createdAt: new Date() },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = {
      goal: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      transaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
      familyMember: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      familyGroup: {
        create: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    };

    goalService = new GoalService(mockPrisma);
  });

  describe('createGoal', () => {
    it('should create a new goal', async () => {
      const input = {
        familyGroupId: 'family-1',
        title: 'House down payment',
        targetAmount: 50000,
        deadline: new Date('2028-12-31'),
        category: 'home',
      };

      mockPrisma.goal.create.mockResolvedValue({ ...mockGoal, ...input });

      const result = await goalService.createGoal(input);

      expect(mockPrisma.goal.create).toHaveBeenCalledWith({
        data: input,
      });
      expect(result.title).toBe('House down payment');
      expect(result.targetAmount).toBe(50000);
    });
  });

  describe('getGoal', () => {
    it('should return goal with progress calculations', async () => {
      mockPrisma.goal.findUnique.mockResolvedValue(mockGoal);

      const result = await goalService.getGoal('goal-1');

      expect(result).toBeDefined();
      expect(result?.transactionSum).toBe(1500); // 1000 + 500
      expect(result?.progressPercentage).toBe(30); // 1500/5000 * 100
      expect(result?.progressPercentage).toBeLessThanOrEqual(100);
    });

    it('should return null for non-existent goal', async () => {
      mockPrisma.goal.findUnique.mockResolvedValue(null);

      const result = await goalService.getGoal('non-existent');

      expect(result).toBeNull();
    });

    it('should calculate on-track status correctly', async () => {
      const goalNearDeadline = {
        ...mockGoal,
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day left
        transactions: [{ ...mockGoal.transactions[0], amount: 4800 }], // 4800/5000
      };

      mockPrisma.goal.findUnique.mockResolvedValue(goalNearDeadline);

      const result = await goalService.getGoal('goal-1');

      expect(result?.onTrack).toBeDefined();
      expect(result?.daysRemaining).toBeLessThanOrEqual(1);
    });
  });

  describe('getGoalsByFamily', () => {
    it('should return all goals for a family group', async () => {
      mockPrisma.goal.findMany.mockResolvedValue([mockGoal, mockGoal]);

      const result = await goalService.getGoalsByFamily('family-1');

      expect(mockPrisma.goal.findMany).toHaveBeenCalledWith({
        where: { familyGroupId: 'family-1' },
        include: { transactions: true },
        orderBy: { deadline: 'asc' },
      });
      expect(result.length).toBe(2);
      expect(result[0].transactionSum).toBe(1500);
    });

    it('should return empty array when family has no goals', async () => {
      mockPrisma.goal.findMany.mockResolvedValue([]);

      const result = await goalService.getGoalsByFamily('family-1');

      expect(result).toEqual([]);
    });
  });

  describe('updateGoal', () => {
    it('should update goal fields', async () => {
      const updateData = { title: 'Updated title', status: 'paused' };
      mockPrisma.goal.update.mockResolvedValue({ ...mockGoal, ...updateData });

      const result = await goalService.updateGoal('goal-1', updateData);

      expect(mockPrisma.goal.update).toHaveBeenCalledWith({
        where: { id: 'goal-1' },
        data: updateData,
      });
      expect(result.title).toBe('Updated title');
      expect(result.status).toBe('paused');
    });
  });

  describe('deleteGoal', () => {
    it('should delete a goal', async () => {
      mockPrisma.goal.delete.mockResolvedValue(mockGoal);

      const result = await goalService.deleteGoal('goal-1');

      expect(mockPrisma.goal.delete).toHaveBeenCalledWith({
        where: { id: 'goal-1' },
      });
      expect(result.id).toBe('goal-1');
    });
  });

  describe('addTransaction', () => {
    it('should add a transaction to a goal', async () => {
      const mockTransaction = {
        id: 'tx-3',
        goalId: 'goal-1',
        amount: 250,
        description: 'Extra payment',
        date: new Date(),
        createdAt: new Date(),
      };

      mockPrisma.transaction.create.mockResolvedValue(mockTransaction);

      const result = await goalService.addTransaction('goal-1', 250, 'Extra payment');

      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: {
          goalId: 'goal-1',
          amount: 250,
          description: 'Extra payment',
        },
      });
      expect(result.amount).toBe(250);
    });

    it('should handle transaction without description', async () => {
      const mockTransaction = {
        id: 'tx-4',
        goalId: 'goal-1',
        amount: 100,
        description: undefined,
        date: new Date(),
        createdAt: new Date(),
      };

      mockPrisma.transaction.create.mockResolvedValue(mockTransaction);

      const result = await goalService.addTransaction('goal-1', 100);

      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: {
          goalId: 'goal-1',
          amount: 100,
          description: undefined,
        },
      });
      expect(result.description).toBeUndefined();
    });
  });

  describe('getGoalTransactions', () => {
    it('should return all transactions for a goal', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue(mockGoal.transactions);

      const result = await goalService.getGoalTransactions('goal-1');

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
        where: { goalId: 'goal-1' },
        orderBy: { date: 'desc' },
      });
      expect(result.length).toBe(2);
    });
  });

  describe('deleteTransaction', () => {
    it('should delete a transaction', async () => {
      mockPrisma.transaction.delete.mockResolvedValue(mockGoal.transactions[0]);

      const result = await goalService.deleteTransaction('tx-1');

      expect(mockPrisma.transaction.delete).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
      });
      expect(result.id).toBe('tx-1');
    });
  });

  describe('getOrCreateUserFamilyGroup', () => {
    it('should return existing family group', async () => {
      mockPrisma.familyMember.findFirst.mockResolvedValue({
        familyGroupId: 'family-1',
        familyGroup: { id: 'family-1', name: 'Test Family' },
      });

      const result = await goalService.getOrCreateUserFamilyGroup('user-1', 'John Doe');

      expect(result).toBe('family-1');
      expect(mockPrisma.familyGroup.create).not.toHaveBeenCalled();
    });

    it('should create new family group if user has none', async () => {
      mockPrisma.familyMember.findFirst.mockResolvedValue(null);
      mockPrisma.familyGroup.create.mockResolvedValue({
        id: 'family-new',
        name: "John Doe's Family",
      });

      const result = await goalService.getOrCreateUserFamilyGroup('user-1', 'John Doe');

      expect(mockPrisma.familyGroup.create).toHaveBeenCalled();
      expect(result).toBe('family-new');
    });
  });

  describe('progress calculations', () => {
    it('should correctly calculate progress percentage', async () => {
      const goal = {
        ...mockGoal,
        transactions: [{ ...mockGoal.transactions[0], amount: 5000 }],
      };

      mockPrisma.goal.findUnique.mockResolvedValue(goal);

      const result = await goalService.getGoal('goal-1');

      expect(result?.progressPercentage).toBe(100);
    });

    it('should cap progress at 100%', async () => {
      const goal = {
        ...mockGoal,
        transactions: [{ ...mockGoal.transactions[0], amount: 6000 }],
      };

      mockPrisma.goal.findUnique.mockResolvedValue(goal);

      const result = await goalService.getGoal('goal-1');

      expect(result?.progressPercentage).toBe(100);
    });

    it('should calculate days remaining correctly', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      const goal = {
        ...mockGoal,
        deadline: futureDate,
      };

      mockPrisma.goal.findUnique.mockResolvedValue(goal);

      const result = await goalService.getGoal('goal-1');

      expect(result?.daysRemaining).toBeGreaterThanOrEqual(9);
      expect(result?.daysRemaining).toBeLessThanOrEqual(10);
    });
  });
});
