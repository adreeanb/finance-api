import { api } from './api';

export interface FixedExpense {
  id: string;
  description: string;
  amount: number;
  dueDate?: number;
  isActive: boolean;
  categoryId: string;
  category?: { id: string; name: string; };
}

export interface CreateFixedExpenseInput {
  description: string;
  amount: number;
  dueDate?: number;
  categoryId: string;
}

export async function getFixedExpenses(): Promise<FixedExpense[]> {
  const response = await api.get('/fixed-expenses');
  return response.data;
}

export async function createFixedExpense(data: CreateFixedExpenseInput): Promise<FixedExpense> {
  const response = await api.post('/fixed-expenses', data);
  return response.data;
}

export async function deleteFixedExpense(id: string): Promise<void> {
  await api.delete(`/fixed-expenses/${id}`);
}