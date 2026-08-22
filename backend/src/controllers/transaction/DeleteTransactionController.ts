import { Request, Response } from 'express';
import { DeleteTransactionService } from '../../services/transaction/DeleteTransactionService';

export class DeleteTransactionController {
  async handle(req: Request, res: Response) {
    // 1. Pega o ID da transação que está na URL (ex: DELETE /transactions/999)
    const id = req.params.id as string; 

    // 2. Pega o ID do usuário logado que vem no Header
    const userId = req.user_id;

    const deleteTransactionService = new DeleteTransactionService();
    
    const result = await deleteTransactionService.execute({ id, userId });

    return res.json(result);
  }
}