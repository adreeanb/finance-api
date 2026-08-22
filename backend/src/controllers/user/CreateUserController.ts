import { Request, Response } from 'express';
import { z } from 'zod';
import { CreateUserService } from '../../services/user/CreateUserService';

export class CreateUserController {
  async handle(req: Request, res: Response) {
  
    const createUsersBodySchema = z.object({
          name: z.string({ message: "O nome é obrigatório e deve ser um texto válido." })
                 .min(3, "O nome deve ter pelo menos 3 caracteres."),
          
          email: z.string({ message: "O email é obrigatório e deve ser um email válido." })
                 .email("O email fornecido não é válido."),
              
          phone: z.string({ message: "O telefone é obrigatório e deve ser um número válido." })
                 .min(10, "O telefone deve ter pelo menos 10 caracteres.")
                 .max(15, "O telefone não pode ter mais de 15 caracteres."),
          salary: z.string({ message: "O salário é obrigatório e deve ser um valor válido." })
                 .regex(/^\d+(\.\d{2})?$/, "O salário deve ser um valor numérico válido."),
          
          password: z.string({ message: "A senha é obrigatória e deve ter pelo menos 6 caracteres." })
                    .min(6, "A senha deve ter pelo menos 6 caracteres.")
  
    });

    const { name, email, phone, salary, password } = createUsersBodySchema.parse(req.body);

    const createUserService = new CreateUserService();

    const user = await createUserService.execute({
      name,
      email,
      phone,
      salary: parseFloat(salary),
      password,
    });

    return res.status(201).json(user);
  }
}