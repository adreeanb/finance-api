import { Request, Response } from 'express';
import { DeleteFixedExpenseService } from '../../services/fixedExpense/DeleteFixedExpenseService.js';

export class DeleteFixedExpenseController {
  async handle(req: Request, res: Response) {
    const id = req.params.id as string;
    const userId = req.user_id;

    const deleteFixedExpenseService = new DeleteFixedExpenseService();
    await deleteFixedExpenseService.execute(id, userId);

    return res.status(204).send();
  }
}