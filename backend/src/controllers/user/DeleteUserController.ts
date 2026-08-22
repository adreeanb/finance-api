import { Request, Response } from 'express';
import { DeleteUserService } from '../../services/user/DeleteUserService';

export class DeleteUserController {
  async handle(req: Request, res: Response) {
    const id = req.user_id;

    const deleteUserService = new DeleteUserService();
    
    const result = await deleteUserService.execute({ id });

    return res.json(result);
  }
}