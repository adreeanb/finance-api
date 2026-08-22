import { api } from './api';

export interface Installment {
  id: string;
  description: string;
  totalAmount: number;
  totalInstallments: number;
  installmentValue: number;
  startDate: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
}

export interface CreateInstallmentInput {
  description: string;
  totalAmount: number;
  totalInstallments: number;
  startDate: string;
  categoryId: string;
}

export async function getInstallments(): Promise<Installment[]> {
  const response = await api.get('/installments');
  return response.data;
}

export async function createInstallment(data: CreateInstallmentInput): Promise<Installment> {
  const response = await api.post('/installments', data);
  return response.data;
}

export async function deleteInstallment(id: string): Promise<void> {
  await api.delete(`/installments/${id}`);
}