import { Request, Response } from 'express';
import { CreateInstallmentService } from '../../services/installment/CreateInstallmentService.js';

export class CreateInstallmentController {
  async handle(req: Request, res: Response) {
    const { description, totalAmount, totalInstallments, startDate, categoryId } = req.body;
    const userId = req.user_id;

    const createInstallmentService = new CreateInstallmentService();
    const installment = await createInstallmentService.execute({
      description,
      totalAmount: Number(totalAmount),
      totalInstallments: Number(totalInstallments),
      startDate,
      categoryId,
      userId,
    });

    return res.status(201).json(installment);
  }
}