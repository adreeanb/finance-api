import { prisma } from '../../lib/prisma';

export class DeleteFixedExpenseService {
  async execute(id: string, userId: string) {
    await prisma.fixedExpense.deleteMany({
      where: { id, userId },
    });
  }
}