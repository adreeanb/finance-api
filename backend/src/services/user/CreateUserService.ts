import { hash } from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';

interface CreateUserRequest {
  name: string;
  email: string;
  phone: string;
  salary: number;
  password: string;
}

export class CreateUserService{
    async execute({ name, email, phone, salary, password }: CreateUserRequest) {
        const userAlreadyExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userAlreadyExists) {
      throw new Error('User already exists');
    }

    const passwordHash = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        salary,
        password: passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        salary: true,
        createdAt: true,
      },
    });

    return user;
  }
}