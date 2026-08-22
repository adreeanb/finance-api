import { Request, Response } from 'express';
import { z } from 'zod';
import { CreateTransactionService } from '../../services/transaction/CreateTransactionService';

export class CreateTransactionController {
  async handle(req: Request, res: Response) {
    
    // Voltamos para a sintaxe simples e segura do Zod que funcionou nas categorias
    const createTransactionBodySchema = z.object({
      description: z.string({ message: "A descrição é obrigatória e deve ser um texto válido." })
             .min(3, "A descrição deve ter pelo menos 3 caracteres."),
      
      amount: z.number({ message: "O valor é obrigatório e deve ser um número." })
               .positive("O valor da transação deve ser positivo."),
      
      type: z.enum(['INCOME', 'EXPENSE'], { message: "O tipo da transação deve ser INCOME ou EXPENSE." }),
      
      date: z.coerce.date({ message: "A data é obrigatória e deve ter um formato válido." }),
      
      categoryId: z.string({ message: "O ID da categoria é obrigatório." })
                   .min(1, "O ID da categoria não pode estar vazio.")
    });

    const { description, amount, type, date, categoryId } = createTransactionBodySchema.parse(req.body);
    
    const user_id = req.user_id;

    const createTransactionService = new CreateTransactionService();
    
    const transaction = await createTransactionService.execute({
      description,
      amount,
      type,
      date,
      categoryId,
      userId: user_id
    });

    return res.json(transaction);
  }
}