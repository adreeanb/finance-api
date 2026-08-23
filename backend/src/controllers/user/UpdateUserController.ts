import { Request, Response } from 'express';
import { UpdateUserService } from '../../services/user/UpdateUserService.js';

export class UpdateUserController {
  async handle(req: Request, res: Response) {
    const id = req.user_id;
    const { name, email, phone, salary } = req.body;

    const updateUserService = new UpdateUserService();
    
    const user = await updateUserService.execute({ user_id: id, name, salary, email, phone });

    return res.json(user);
  }
}