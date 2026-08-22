import { Request, Response } from 'express';
import { CurrentUserService } from '../../services/user/CurrentUserService';
import { prisma } from '../../lib/prisma';

class CurrentUserController {
  async handle(req: Request, res: Response) {
    // O id do usuário geralmente é injetado no request pelo middleware de autenticação
    const user_id = req.user_id; 

    const currentUserService = new CurrentUserService();
    const user = await prisma.user.findUnique({
      where: { id: user_id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        salary: true,
      }
    });

    return res.json(user);
  }
}

export { CurrentUserController };