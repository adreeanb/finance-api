import { Request, Response } from 'express';
import { ListFixedExpensesService } from '../../services/fixedExpense/ListFixedExpensesService';

export class ListFixedExpensesController {
  async handle(req: Request, res: Response) {
    const userId = req.user_id;
    const listFixedExpensesService = new ListFixedExpensesService();
    const fixedExpenses = await listFixedExpensesService.execute(userId);

    return res.json(fixedExpenses);
  }
}