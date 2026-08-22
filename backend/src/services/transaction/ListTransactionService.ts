import { prisma } from "../../lib/prisma.js"; 

interface ListTransactionRequest {
  userId: string;
}

export class ListTransactionService {
  async execute({ userId }: ListTransactionRequest) {
    
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: userId, // Lembre-se de checar se no seu schema.prisma está userId ou user_id
      },
      // 1. Ordenação: traz as transações da mais recente para a mais antiga
      orderBy: {
        date: 'desc' 
      },
      // 2. Relacionamento: Em vez de trazer apenas o categoryId, trazemos os dados da categoria!
      include: {
        category: {
          select: {
            name: true,
            icon: true
          }
        }
      }
    });

    return transactions;
  }
}