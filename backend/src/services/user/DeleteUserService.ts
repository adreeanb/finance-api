import { prisma } from '../../lib/prisma';

interface DeleteUserRequest {
  id: string;
}

export class DeleteUserService {
  async execute({ id }: DeleteUserRequest) {
    const userExists = await prisma.user.findUnique({
      where: { id }
    });

    if (!userExists) {
      throw new Error('Usuário não encontrado.');
    }

    await prisma.user.delete({
      where: { id }
    });

    return { message: 'Usuário deletado com sucesso.' };
  }
}