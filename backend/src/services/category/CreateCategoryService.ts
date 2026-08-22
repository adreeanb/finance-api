import { prisma } from '../../lib/prisma.js';
import { TransactionType } from '@prisma/client';

interface CreateCategoryRequest {
  name: string;
  icon?: string;
  type: TransactionType;
  userId: string;
}

export class CreateCategoryService {
  async execute({ name, icon, type, userId }: CreateCategoryRequest) {
    const category = await prisma.category.create({
      data: {
        name,
        icon,
        type,
        userId,
      }
    });

    return category;
  }
}