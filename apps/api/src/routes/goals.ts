import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { goalService } from '../services/GoalService';
import { telemetryService } from '../services/TelemetryService';

const router = Router();

// Get or create user's family group and list goals
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const familyGroupId = await goalService.getOrCreateUserFamilyGroup(req.user.userId, user.name);
    const goals = await goalService.getGoalsByFamily(familyGroupId);

    telemetryService.trackEvent({
      eventName: 'goals_listed',
      userId: req.user.userId,
      familyGroupId,
      properties: { goalCount: goals.length },
    });

    res.json({
      success: true,
      familyGroupId,
      goals,
    });
  } catch (error) {
    console.error('Get goals error:', error);
    telemetryService.trackEvent({
      eventName: 'get_goals_error',
      userId: req.user?.userId,
      properties: { error: String(error) },
      severity: 'error',
    });
    res.status(500).json({
      success: false,
      error: 'Failed to get goals',
    });
  }
});

// Create a new goal
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const { familyGroupId, title, targetAmount, deadline, category } = req.body;

    if (!title || !targetAmount || !deadline || !category) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
      return;
    }

    if (targetAmount <= 0) {
      res.status(400).json({
        success: false,
        error: 'Target amount must be positive',
      });
      return;
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const membership = await prisma.familyMember.findUnique({
      where: {
        familyGroupId_userId: {
          familyGroupId,
          userId: req.user.userId,
        },
      },
    });

    if (!membership) {
      res.status(403).json({
        success: false,
        error: 'Not a member of this family group',
      });
      return;
    }

    const goal = await goalService.createGoal({
      familyGroupId,
      title,
      targetAmount,
      deadline: new Date(deadline),
      category,
    });

    telemetryService.trackEvent({
      eventName: 'goal_created',
      userId: req.user.userId,
      familyGroupId,
      properties: { goalId: goal.id, category, targetAmount },
    });

    res.status(201).json({
      success: true,
      goal,
    });
  } catch (error) {
    console.error('Create goal error:', error);
    telemetryService.trackEvent({
      eventName: 'create_goal_error',
      userId: req.user?.userId,
      properties: { error: String(error) },
      severity: 'error',
    });
    res.status(500).json({
      success: false,
      error: 'Failed to create goal',
    });
  }
});

// Get a specific goal
router.get('/:goalId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const goal = await goalService.getGoal(req.params.goalId);

    if (!goal) {
      res.status(404).json({ success: false, error: 'Goal not found' });
      return;
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const membership = await prisma.familyMember.findUnique({
      where: {
        familyGroupId_userId: {
          familyGroupId: goal.familyGroupId,
          userId: req.user.userId,
        },
      },
    });

    if (!membership) {
      res.status(403).json({
        success: false,
        error: 'No access to this goal',
      });
      return;
    }

    res.json({
      success: true,
      goal,
    });
  } catch (error) {
    console.error('Get goal error:', error);
    telemetryService.trackEvent({
      eventName: 'get_goal_error',
      userId: req.user?.userId,
      properties: { goalId: req.params.goalId, error: String(error) },
      severity: 'error',
    });
    res.status(500).json({
      success: false,
      error: 'Failed to get goal',
    });
  }
});

// Update a goal
router.patch('/:goalId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const { title, targetAmount, deadline, category, status } = req.body;
    const currentGoal = await goalService.getGoal(req.params.goalId);

    if (!currentGoal) {
      res.status(404).json({ success: false, error: 'Goal not found' });
      return;
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const membership = await prisma.familyMember.findUnique({
      where: {
        familyGroupId_userId: {
          familyGroupId: currentGoal.familyGroupId,
          userId: req.user.userId,
        },
      },
    });

    if (!membership) {
      res.status(403).json({
        success: false,
        error: 'No access to this goal',
      });
      return;
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (targetAmount) updateData.targetAmount = targetAmount;
    if (deadline) updateData.deadline = new Date(deadline);
    if (category) updateData.category = category;
    if (status) updateData.status = status;

    const goal = await goalService.updateGoal(req.params.goalId, updateData);

    telemetryService.trackEvent({
      eventName: 'goal_updated',
      userId: req.user.userId,
      familyGroupId: currentGoal.familyGroupId,
      properties: { goalId: req.params.goalId, fields: Object.keys(updateData) },
    });

    res.json({
      success: true,
      goal,
    });
  } catch (error) {
    console.error('Update goal error:', error);
    telemetryService.trackEvent({
      eventName: 'update_goal_error',
      userId: req.user?.userId,
      properties: { goalId: req.params.goalId, error: String(error) },
      severity: 'error',
    });
    res.status(500).json({
      success: false,
      error: 'Failed to update goal',
    });
  }
});

// Delete a goal
router.delete('/:goalId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const currentGoal = await goalService.getGoal(req.params.goalId);

    if (!currentGoal) {
      res.status(404).json({ success: false, error: 'Goal not found' });
      return;
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const membership = await prisma.familyMember.findUnique({
      where: {
        familyGroupId_userId: {
          familyGroupId: currentGoal.familyGroupId,
          userId: req.user.userId,
        },
      },
    });

    if (!membership) {
      res.status(403).json({
        success: false,
        error: 'No access to this goal',
      });
      return;
    }

    await goalService.deleteGoal(req.params.goalId);

    telemetryService.trackEvent({
      eventName: 'goal_deleted',
      userId: req.user.userId,
      familyGroupId: currentGoal.familyGroupId,
      properties: { goalId: req.params.goalId },
    });

    res.json({
      success: true,
      message: 'Goal deleted',
    });
  } catch (error) {
    console.error('Delete goal error:', error);
    telemetryService.trackEvent({
      eventName: 'delete_goal_error',
      userId: req.user?.userId,
      properties: { goalId: req.params.goalId, error: String(error) },
      severity: 'error',
    });
    res.status(500).json({
      success: false,
      error: 'Failed to delete goal',
    });
  }
});

// Add transaction to goal
router.post('/:goalId/transactions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({
        success: false,
        error: 'Amount must be positive',
      });
      return;
    }

    const goal = await goalService.getGoal(req.params.goalId);

    if (!goal) {
      res.status(404).json({ success: false, error: 'Goal not found' });
      return;
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const membership = await prisma.familyMember.findUnique({
      where: {
        familyGroupId_userId: {
          familyGroupId: goal.familyGroupId,
          userId: req.user.userId,
        },
      },
    });

    if (!membership) {
      res.status(403).json({
        success: false,
        error: 'No access to this goal',
      });
      return;
    }

    const transaction = await goalService.addTransaction(req.params.goalId, amount, description);

    telemetryService.trackEvent({
      eventName: 'transaction_added',
      userId: req.user.userId,
      familyGroupId: goal.familyGroupId,
      properties: { goalId: req.params.goalId, amount, transactionId: transaction.id },
    });

    res.status(201).json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error('Add transaction error:', error);
    telemetryService.trackEvent({
      eventName: 'add_transaction_error',
      userId: req.user?.userId,
      properties: { goalId: req.params.goalId, error: String(error) },
      severity: 'error',
    });
    res.status(500).json({
      success: false,
      error: 'Failed to add transaction',
    });
  }
});

// Get transactions for a goal
router.get('/:goalId/transactions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const goal = await goalService.getGoal(req.params.goalId);

    if (!goal) {
      res.status(404).json({ success: false, error: 'Goal not found' });
      return;
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const membership = await prisma.familyMember.findUnique({
      where: {
        familyGroupId_userId: {
          familyGroupId: goal.familyGroupId,
          userId: req.user.userId,
        },
      },
    });

    if (!membership) {
      res.status(403).json({
        success: false,
        error: 'No access to this goal',
      });
      return;
    }

    const transactions = await goalService.getGoalTransactions(req.params.goalId);

    res.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    telemetryService.trackEvent({
      eventName: 'get_transactions_error',
      userId: req.user?.userId,
      properties: { goalId: req.params.goalId, error: String(error) },
      severity: 'error',
    });
    res.status(500).json({
      success: false,
      error: 'Failed to get transactions',
    });
  }
});

// Delete a transaction
router.delete('/:goalId/transactions/:transactionId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const goal = await goalService.getGoal(req.params.goalId);

    if (!goal) {
      res.status(404).json({ success: false, error: 'Goal not found' });
      return;
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const membership = await prisma.familyMember.findUnique({
      where: {
        familyGroupId_userId: {
          familyGroupId: goal.familyGroupId,
          userId: req.user.userId,
        },
      },
    });

    if (!membership) {
      res.status(403).json({
        success: false,
        error: 'No access to this goal',
      });
      return;
    }

    await goalService.deleteTransaction(req.params.transactionId);

    telemetryService.trackEvent({
      eventName: 'transaction_deleted',
      userId: req.user.userId,
      familyGroupId: goal.familyGroupId,
      properties: { goalId: req.params.goalId, transactionId: req.params.transactionId },
    });

    res.json({
      success: true,
      message: 'Transaction deleted',
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    telemetryService.trackEvent({
      eventName: 'delete_transaction_error',
      userId: req.user?.userId,
      properties: { goalId: req.params.goalId, transactionId: req.params.transactionId, error: String(error) },
      severity: 'error',
    });
    res.status(500).json({
      success: false,
      error: 'Failed to delete transaction',
    });
  }
});

export default router;
