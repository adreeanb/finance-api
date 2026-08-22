import { prisma } from '../../lib/prisma.js';

interface UpdateUserRequest {
  user_id: string;
  name?: string;
  email?: string;
  phone?: string;
  salary?: number;
}

class UpdateUserService {
  async execute({ user_id, name, email, phone, salary }: UpdateUserRequest) {
    const user = await prisma.user.update({
      where: { id: user_id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(salary !== undefined && { salary }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        salary: true,
      }
    });

    return user;
  }
}

export { UpdateUserService };