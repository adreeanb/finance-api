import { Request, Response } from 'express';
import { UpdateTransactionService } from '../../services/transaction/UpdateTransactionService.js';

export class UpdateTransactionController {
  async handle(req: Request, res: Response) {
    const id = req.params.id as string; // Pega o ID da transação: PUT /transactions/:id
    const { description, amount, type, date, categoryId } = req.body;
    const userId = req.user_id;

    const updateTransactionService = new UpdateTransactionService();
    
    const transaction = await updateTransactionService.execute({
      id, userId, description, amount, type, date, categoryId
    });

    return res.json(transaction);
  }
}
    
