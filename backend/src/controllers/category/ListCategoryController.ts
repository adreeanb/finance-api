import { Request, Response } from 'express';
import { ListCategoryService } from '../../services/category/ListCategoryService';

export class ListCategoryController {
  async handle(req: Request, res: Response) {
    // Pegamos o user_id que foi injetado pelo middleware isAuthenticated!
    const user_id = req.user_id;

    const listCategoryService = new ListCategoryService();

    const categories = await listCategoryService.execute({ user_id });

    return res.json(categories);
  }
}