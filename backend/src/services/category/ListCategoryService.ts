import { prisma } from "../../lib/prisma.js";

interface CategoryRequest {
  user_id: string;
}

export class ListCategoryService {
  async execute({ user_id }: CategoryRequest) {
    
    // O findMany busca uma lista (array) de registros
    const categories = await prisma.category.findMany({
      where: {
        userId: user_id, // Filtra pelo ID do dono da categoria (verifique se no seu schema.prisma o campo se chama user_id ou userId)
      },
      select: {
        // O select é opcional, mas é uma boa prática para não retornar dados desnecessários 
        // (como datas de update, se o frontend não for usar)
        id: true,
        name: true,
      }
    });

    return categories;
  }
}