import { prisma } from '../../lib/prisma.js';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface AuthRequest {
  email: string;
  password: string; // Para ficar fácil, vou chamar o campo do formulário de password
}

export class AuthUserService {
  async execute({ email, password }: AuthRequest) {
    // 1. Verifica se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('E-mail/senha incorretos.');
    }

    // 2. Verifica se a senha bate com o hash do banco
    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new Error('E-mail/senha incorretos.'); 
    }

    // 3. Gera o Token JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('Chave JWT não configurada no servidor.');
    }

    const token = jwt.sign(
      {
        name: user.name,
        email: user.email,
      },
      secret,
      {
        subject: user.id, 
        expiresIn: '30d' 
      }
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      token: token
    };
  }
}