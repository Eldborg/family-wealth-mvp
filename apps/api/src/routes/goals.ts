import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Middleware to verify family membership
async function verifyFamilyMembership(
  userId: string,
  familyGroupId: string
): Promise<boolean> {
  const member = await prisma.familyMember.findUnique({
    where: {
      familyGroupId_userId: {
        familyGroupId,
        userId,
      },
    },
  });
  return !!member;
}

/**
 * GET /api/goals?familyGroupId={id}
 * Get all goals for a family group
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { familyGroupId } = req.query;

    if (!familyGroupId || typeof familyGroupId !== 'string') {
      res.status(400).json({
        success: false,
        error: 'familyGroupId is required',
      });
      return;
    }

    // Verify user is a member of this family group
    const isMember = await verifyFamilyMembership(req.user?.userId!, familyGroupId);
    if (!isMember) {
      res.status(403).json({
        success: false,
        error: 'You do not have access to this family group',
      });
      return;
    }

    const goals = await prisma.goal.findMany({
      where: { familyGroupId },
      include: {
        transactions: {
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate progress percentage for each goal
    const goalsWithProgress = goals.map((goal) => ({
      ...goal,
      progressPercentage: goal.targetAmount > 0 ? (goal.progress / goal.targetAmount) * 100 : 0,
      transactionCount: goal.transactions.length,
    }));

    res.json({
      success: true,
      goals: goalsWithProgress,
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch goals',
    });
  }
});

/**
 * POST /api/goals
 * Create a new goal
 */
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { familyGroupId, title, targetAmount, deadline, category } = req.body;

    // Validate required fields
    if (!familyGroupId || !title || !targetAmount || !deadline || !category) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: familyGroupId, title, targetAmount, deadline, category',
      });
      return;
    }

    // Verify user is a member of this family group
    const isMember = await verifyFamilyMembership(req.user?.userId!, familyGroupId);
    if (!isMember) {
      res.status(403).json({
        success: false,
        error: 'You do not have access to this family group',
      });
      return;
    }

    // Validate inputs
    if (typeof targetAmount !== 'number' || targetAmount <= 0) {
      res.status(400).json({
        success: false,
        error: 'targetAmount must be a positive number',
      });
      return;
    }

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      res.status(400).json({
        success: false,
        error: 'deadline must be a valid date',
      });
      return;
    }

    const goal = await prisma.goal.create({
      data: {
        familyGroupId,
        title,
        targetAmount,
        deadline: deadlineDate,
        category,
        status: 'active',
      },
      include: {
        transactions: true,
      },
    });

    res.status(201).json({
      success: true,
      goal: {
        ...goal,
        progressPercentage: (goal.progress / goal.targetAmount) * 100,
      },
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create goal',
    });
  }
});

/**
 * GET /api/goals/{id}
 * Get a specific goal with transactions
 */
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const goal = await prisma.goal.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!goal) {
      res.status(404).json({
        success: false,
        error: 'Goal not found',
      });
      return;
    }

    // Verify user is a member of this family group
    const isMember = await verifyFamilyMembership(req.user?.userId!, goal.familyGroupId);
    if (!isMember) {
      res.status(403).json({
        success: false,
        error: 'You do not have access to this goal',
      });
      return;
    }

    res.json({
      success: true,
      goal: {
        ...goal,
        progressPercentage: goal.targetAmount > 0 ? (goal.progress / goal.targetAmount) * 100 : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch goal',
    });
  }
});

/**
 * PATCH /api/goals/{id}
 * Update a goal
 */
router.patch('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, targetAmount, deadline, category, status } = req.body;

    const goal = await prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      res.status(404).json({
        success: false,
        error: 'Goal not found',
      });
      return;
    }

    // Verify user is a member of this family group
    const isMember = await verifyFamilyMembership(req.user?.userId!, goal.familyGroupId);
    if (!isMember) {
      res.status(403).json({
        success: false,
        error: 'You do not have access to this goal',
      });
      return;
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (targetAmount !== undefined) {
      if (typeof targetAmount !== 'number' || targetAmount <= 0) {
        res.status(400).json({
          success: false,
          error: 'targetAmount must be a positive number',
        });
        return;
      }
      updateData.targetAmount = targetAmount;
    }
    if (deadline !== undefined) {
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        res.status(400).json({
          success: false,
          error: 'deadline must be a valid date',
        });
        return;
      }
      updateData.deadline = deadlineDate;
    }
    if (category !== undefined) updateData.category = category;
    if (status !== undefined) {
      if (!['active', 'completed', 'paused'].includes(status)) {
        res.status(400).json({
          success: false,
          error: 'status must be one of: active, completed, paused',
        });
        return;
      }
      updateData.status = status;
    }

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: updateData,
      include: {
        transactions: true,
      },
    });

    res.json({
      success: true,
      goal: {
        ...updatedGoal,
        progressPercentage: updatedGoal.targetAmount > 0 ? (updatedGoal.progress / updatedGoal.targetAmount) * 100 : 0,
      },
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update goal',
    });
  }
});

/**
 * DELETE /api/goals/{id}
 * Delete a goal
 */
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const goal = await prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      res.status(404).json({
        success: false,
        error: 'Goal not found',
      });
      return;
    }

    // Verify user is a member of this family group
    const isMember = await verifyFamilyMembership(req.user?.userId!, goal.familyGroupId);
    if (!isMember) {
      res.status(403).json({
        success: false,
        error: 'You do not have access to this goal',
      });
      return;
    }

    await prisma.goal.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Goal deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete goal',
    });
  }
});

/**
 * POST /api/goals/{id}/transactions
 * Add a transaction to a goal (track progress)
 */
router.post('/:goalId/transactions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { goalId } = req.params;
    const { amount, description, date } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({
        success: false,
        error: 'amount must be a positive number',
      });
      return;
    }

    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      res.status(404).json({
        success: false,
        error: 'Goal not found',
      });
      return;
    }

    // Verify user is a member of this family group
    const isMember = await verifyFamilyMembership(req.user?.userId!, goal.familyGroupId);
    if (!isMember) {
      res.status(403).json({
        success: false,
        error: 'You do not have access to this goal',
      });
      return;
    }

    const transactionDate = date ? new Date(date) : new Date();
    if (isNaN(transactionDate.getTime())) {
      res.status(400).json({
        success: false,
        error: 'date must be a valid date',
      });
      return;
    }

    const transaction = await prisma.transaction.create({
      data: {
        goalId,
        amount,
        description: description || '',
        date: transactionDate,
      },
    });

    // Update goal progress
    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        progress: {
          increment: amount,
        },
      },
      include: {
        transactions: true,
      },
    });

    res.status(201).json({
      success: true,
      transaction,
      goal: {
        ...updatedGoal,
        progressPercentage: updatedGoal.targetAmount > 0 ? (updatedGoal.progress / updatedGoal.targetAmount) * 100 : 0,
      },
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add transaction',
    });
  }
});

/**
 * GET /api/goals/{id}/transactions
 * Get all transactions for a goal
 */
router.get('/:goalId/transactions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { goalId } = req.params;

    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      res.status(404).json({
        success: false,
        error: 'Goal not found',
      });
      return;
    }

    // Verify user is a member of this family group
    const isMember = await verifyFamilyMembership(req.user?.userId!, goal.familyGroupId);
    if (!isMember) {
      res.status(403).json({
        success: false,
        error: 'You do not have access to this goal',
      });
      return;
    }

    const transactions = await prisma.transaction.findMany({
      where: { goalId },
      orderBy: { date: 'desc' },
    });

    res.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
    });
  }
});

/**
 * DELETE /api/goals/{id}/transactions/{txId}
 * Delete a transaction
 */
router.delete('/:goalId/transactions/:txId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { goalId, txId } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id: txId },
      include: { goal: true },
    });

    if (!transaction) {
      res.status(404).json({
        success: false,
        error: 'Transaction not found',
      });
      return;
    }

    if (transaction.goal.id !== goalId) {
      res.status(400).json({
        success: false,
        error: 'Transaction does not belong to this goal',
      });
      return;
    }

    // Verify user is a member of this family group
    const isMember = await verifyFamilyMembership(req.user?.userId!, transaction.goal.familyGroupId);
    if (!isMember) {
      res.status(403).json({
        success: false,
        error: 'You do not have access to this transaction',
      });
      return;
    }

    // Delete transaction and update goal progress
    await prisma.transaction.delete({
      where: { id: txId },
    });

    await prisma.goal.update({
      where: { id: goalId },
      data: {
        progress: {
          decrement: transaction.amount,
        },
      },
    });

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete transaction',
    });
  }
});

export default router;
