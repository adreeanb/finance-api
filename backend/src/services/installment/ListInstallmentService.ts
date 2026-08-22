import { prisma }  from '../../lib/prisma';

export class ListInstallmentsService {
  async execute(userId: string) {
    const installments = await prisma.installment.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { startDate: 'desc' },
    });

    return installments;
  }
}