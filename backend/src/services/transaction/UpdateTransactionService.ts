import { prisma } from '../../lib/prisma';
import { TransactionType } from '@prisma/client';

interface UpdateTransactionRequest {
  id: string;
  userId: string;
  description?: string;
  amount?: number;
  type?: TransactionType;
  date?: Date;
  categoryId?: string;
}

export class UpdateTransactionService {
  async execute({ id, userId, description, amount, type, date, categoryId }: UpdateTransactionRequest) {
    const transaction = await prisma.transaction.findUnique({
      where: { id }
    });

    if (!transaction) throw new Error('Transação não encontrada.');
    if (transaction.userId !== userId) throw new Error('Operação não autorizada.');

    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category || category.userId !== userId) {
        throw new Error('Categoria inválida ou não pertence ao usuário.');
      }
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        description,
        amount,
        type,
        date: date ? new Date(date) : undefined,
        categoryId
      }
    });

    return updatedTransaction;
  }
}