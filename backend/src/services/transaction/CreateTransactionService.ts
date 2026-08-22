import { prisma } from '../../lib/prisma';
import { TransactionType } from '@prisma/client';

interface CreateTransactionRequest {
  description: string;
  amount: number;
  type: TransactionType;
  date?: Date;
  categoryId?: string;
  userId: string;
}

export class CreateTransactionService {
  async execute({ description, amount, type, date, categoryId, userId }: CreateTransactionRequest) {
    
    // Se enviou categoria, valida se ela existe e pertence ao usuário
    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category || category.userId !== userId) {
        throw new Error('Categoria inválida ou não pertence ao usuário.');
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        description,
        amount,
        type,
        date: date ? new Date(date) : undefined, // Formata a data se for enviada
        categoryId,
        userId,
      }
    });

    return transaction;
  }
}