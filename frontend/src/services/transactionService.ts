import { api } from './api';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  createdAt: string;
}

// Tipagem para criar uma transação (não enviamos id nem data)
export interface CreateTransactionInput {
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
}

export async function getTransactions(): Promise<Transaction[]> {
  const response = await api.get('/transactions');
  return response.data;
}

// Nova função de POST
export async function createTransaction(data: CreateTransactionInput) {
  const response = await api.post('/transactions', data);
  return response.data;
}

// Nova função de DELETE
export async function deleteTransaction(id: string) {
  const response = await api.delete(`/transactions/${id}`);
  return response.data;
}
