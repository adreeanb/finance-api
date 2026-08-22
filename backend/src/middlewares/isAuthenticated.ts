import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface Payload {
  sub: string;
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // 1. Recebe o token pelo header Authorization (Padrão: "Bearer <token>")
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).end(); // 401 Unauthorized
  }

  // 2. Separa a palavra "Bearer" do token em si
  const [, token] = authToken.split(' ');

  try {
    // 3. Valida o token
    const { sub } = jwt.verify(token, process.env.JWT_SECRET as string) as Payload;

    // 4. Injeta o ID do usuário na requisição para os Controllers usarem!
    req.user_id = sub;

    return next(); // Deixa a requisição continuar para o Controller
  } catch (err) {
    return res.status(401).end();
  }
}