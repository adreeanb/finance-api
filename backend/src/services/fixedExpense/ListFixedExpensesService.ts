import { prisma } from '../../lib/prisma';

export class ListFixedExpensesService {
  async execute(userId: string) {
    const fixedExpenses = await prisma.fixedExpense.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return fixedExpenses;
  }
}