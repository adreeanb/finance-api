import { Request, Response } from 'express';
import { CreateFixedExpenseService } from '../../services/fixedExpense/CreateFixedExpenseService';

export class CreateFixedExpenseController {
  async handle(req: Request, res: Response) {
    const { description, amount, dueDate, categoryId } = req.body;
    const userId = req.user_id;

    const createFixedExpenseService = new CreateFixedExpenseService();
    const fixedExpense = await createFixedExpenseService.execute({
      description,
      amount: Number(amount),
      dueDate: dueDate ? Number(dueDate) : undefined,
      categoryId,
      userId,
    });

    return res.status(201).json(fixedExpense);
  }
}