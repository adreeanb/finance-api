import { prisma } from '../../lib/prisma';
import { TransactionType } from '@prisma/client';

interface UpdateCategoryRequest {
  id: string;
  userId: string;
  name?: string;
  icon?: string;
  type?: TransactionType;
}

export class UpdateCategoryService {
  async execute({ id, userId, name, icon, type }: UpdateCategoryRequest) {
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      throw new Error('Categoria não encontrada.');
    }

    // Segurança: Garantir que a categoria pertence ao usuário logado
    if (category.userId !== userId) {
      throw new Error('Operação não autorizada.');
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name, icon, type }
    });

    return updatedCategory;
  }
}