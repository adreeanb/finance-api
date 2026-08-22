import { api } from './api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  salary: number;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  salary?: number;
}

export async function getUserProfile(): Promise<UserProfile> {
  const response = await api.get('/me');
  return response.data;
}

export async function updateUserProfile(data: UpdateUserInput): Promise<UserProfile> {
  const response = await api.put('/users', data);
  return response.data;
}