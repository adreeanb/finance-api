import { prisma } from '../../lib/prisma';

class CurrentUserService {
  async execute(user_id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id: user_id,
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

export { CurrentUserService };