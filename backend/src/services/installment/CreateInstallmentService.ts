import { prisma } from '../../lib/prisma';

interface CreateInstallmentRequest {
  description: string;
  totalAmount: number;
  totalInstallments: number;
  startDate: string;
  categoryId: string;
  userId: string;
}

export class CreateInstallmentService {
  async execute({ description, totalAmount, totalInstallments, startDate, categoryId, userId }: CreateInstallmentRequest) {
    const installmentValue = Number((totalAmount / totalInstallments).toFixed(2));

    const installment = await prisma.installment.create({
      data: {
        description,
        totalAmount,
        totalInstallments,
        installmentValue,
        startDate: new Date(startDate),
        categoryId,
        userId,
      },
      include: {
        category: true,
      }
    });

    return installment;
  }
}