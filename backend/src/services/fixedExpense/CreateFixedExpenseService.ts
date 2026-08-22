import { prisma } from '../../lib/prisma';

interface CreateFixedExpenseRequest {
  description: string;
  amount: number;
  dueDate?: number;
  categoryId: string;
  userId: string;
}

export class CreateFixedExpenseService {
  async execute({ description, amount, dueDate, categoryId, userId }: CreateFixedExpenseRequest) {
    const fixedExpense = await prisma.fixedExpense.create({
      data: {
        description,
        amount,
        dueDate,
        categoryId,
        userId,
      },
      include: {
        category: true,
      }
    });

    return fixedExpense;
  }
}