import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod/v3';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {

if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Erro de validação nos dados enviados.',
      issues: err.flatten().fieldErrors, // Formata os erros lindamente por campo!
    });
  }
  // 1. Se for um erro conhecido, lançado por nós (ex: throw new Error("Senha inválida"))
  if (err instanceof Error) {
    return res.status(400).json({
      error: err.message,
    });
  }

  // 2. Se for um erro desconhecido (ex: erro interno do banco, falha de sintaxe)
  console.error(err); // Deixamos no console para podermos debugar depois
  
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error.',
  });
}