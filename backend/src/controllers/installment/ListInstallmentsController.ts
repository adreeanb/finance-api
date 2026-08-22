import { Request, Response } from 'express';
import { ListInstallmentsService } from '../../services/installment/ListInstallmentService.js';

export class ListInstallmentsController {
  async handle(req: Request, res: Response) {
    const userId = req.user_id;
    const listInstallmentsService = new ListInstallmentsService();
    const installments = await listInstallmentsService.execute(userId);

    return res.json(installments);
  }
}