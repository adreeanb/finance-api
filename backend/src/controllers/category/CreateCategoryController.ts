import { Request, Response } from 'express';
import { z } from 'zod';
import { CreateCategoryService } from '../../services/category/CreateCategoryService';

export class CreateCategoryController {
  async handle(req: Request, res: Response) {
    // 1. Schema limpo, focando apenas nas propriedades de Categoria
    const createCategoryBodySchema = z.object({
      name: z.string({ message: "O nome é obrigatório e deve ser um texto válido." })
             .min(3, "O nome deve ter pelo menos 3 caracteres."),
      
      icon: z.string().optional(),
      
      type: z.enum(['INCOME', 'EXPENSE'], { message: "O tipo da categoria deve ser INCOME ou EXPENSE." })
    });

    // 2. Extraímos os dados VALIDADOS pelo Zod (evite pegar direto do req.body novamente)
    const { name, icon, type } = createCategoryBodySchema.parse(req.body);
    
    // 3. Pegamos o ID do usuário injetado pelo middleware de autenticação
    const userId = req.user_id;
    
    // 4. Instanciamos e executamos o Service
    const createCategoryService = new CreateCategoryService();
    
    const category = await createCategoryService.execute({
      name, 
      icon, 
      type, 
      userId
    });

    // 5. Retornamos status 201 (Created) informando que o recurso foi criado
    return res.status(201).json(category);
  }
}