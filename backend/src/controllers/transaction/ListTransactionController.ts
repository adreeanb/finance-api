import { Request, Response } from 'express';
import { ListTransactionService } from '../../services/transaction/ListTransactionService';

export class ListTransactionController {
  async handle(req: Request, res: Response) {
    // Pegamos o ID do usuário injetado pelo token
    const user_id = req.user_id;

    const listTransactionService = new ListTransactionService();

    // Executamos o Service passando o ID
    const transactions = await listTransactionService.execute({ 
      userId: user_id 
    });

    return res.json(transactions);
  }
}