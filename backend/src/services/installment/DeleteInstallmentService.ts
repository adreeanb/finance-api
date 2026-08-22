import { prisma } from '../../lib/prisma.js';

export class DeleteInstallmentService {
  async execute(installmentId: string, userId: string) {
    await prisma.installment.deleteMany({
      where: {
        id: installmentId,
        userId,
      },
    });
  }
}