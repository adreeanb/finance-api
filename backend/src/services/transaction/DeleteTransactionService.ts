import { prisma } from '../../lib/prisma';

interface DeleteTransactionRequest {
  id: string;
  userId: string;
}

export class DeleteTransactionService {
  async execute({ id, userId }: DeleteTransactionRequest) {
    const transaction = await prisma.transaction.findUnique({
      where: { id }
    });

    if (!transaction) {
      throw new Error('Transação não encontrada.');
    }

    if (transaction.userId !== userId) {
      throw new Error('Operação não autorizada.');
    }

    await prisma.transaction.delete({
      where: { id }
    });

    return { message: 'Transação deletada com sucesso.' };
  }
}