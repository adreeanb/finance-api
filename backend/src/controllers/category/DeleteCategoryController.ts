import { Request, Response } from 'express';
import { DeleteCategoryService } from '../../services/category/DeleteCategoryService';

export class DeleteCategoryController {
  async handle(req: Request, res: Response) {
    const id = req.params.id as string; // DELETE /categories/:id
    const userId = req.user_id;

    const deleteCategoryService = new DeleteCategoryService();
    
    const result = await deleteCategoryService.execute({ id, userId });

    return res.json(result);
  }
}