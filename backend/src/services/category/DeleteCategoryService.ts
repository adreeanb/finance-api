import { prisma } from '../../lib/prisma';

interface DeleteCategoryRequest {
  id: string;
  userId: string;
}

export class DeleteCategoryService {
  async execute({ id, userId }: DeleteCategoryRequest) {
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      throw new Error('Categoria não encontrada.');
    }

    if (category.userId !== userId) {
      throw new Error('Operação não autorizada.');
    }

    await prisma.category.delete({
      where: { id }
    });

    return { message: 'Categoria deletada com sucesso.' };
  }
}