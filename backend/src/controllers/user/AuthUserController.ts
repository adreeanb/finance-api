import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthUserService } from '../../services/user/AuthUserService';

export class AuthUserController {
  async handle(req: Request, res: Response) {
    
    const authUserBodySchema = z.object({
      email: z.string({ message: "O email é obrigatório e deve ser um email válido." })
             .email("O email fornecido não é válido."),
      
      password: z.string({ message: "A senha é obrigatória e deve ter pelo menos 6 caracteres." })
                 .min(6, "A senha deve ter pelo menos 6 caracteres.")
    });

    const { email, password } = authUserBodySchema.parse(req.body);

    const authUserService = new AuthUserService();

    const auth = await authUserService.execute({
      email,
      password, 
    });

    return res.json(auth);
  }
}