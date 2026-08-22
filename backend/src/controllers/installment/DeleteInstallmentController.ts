import { Request, Response } from 'express';
import { DeleteInstallmentService } from '../../services/installment/DeleteInstallmentService';

export class DeleteInstallmentController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const userId = req.user_id;

    const deleteInstallmentService = new DeleteInstallmentService();
    await deleteInstallmentService.execute(id as string, userId);

    return res.status(204).send();
  }
}