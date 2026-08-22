import { Request, Response } from 'express';
import { UpdateCategoryService } from '../../services/category/UpdateCategoryService.js';

export class UpdateCategoryController {
  async handle(req: Request, res: Response) {
    const id = req.params.id as string; // Pega o ID da URL: PUT /categories/:id
    const { name, icon, type } = req.body;
    const userId = req.user_id;

    const updateCategoryService = new UpdateCategoryService();
    
    const category = await updateCategoryService.execute({
      id, userId, name, icon, type
    });

    return res.json(category);
  }
}                                                                                                                                                                                                                 