const API_BASE = 'http://localhost:3000/api';

export type AuthRole = 'student' | 'teacher' | 'admin';

export interface AuthUser {
  name: string;
  email: string;
  role: AuthRole;
  group?: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: AuthRole;
  group?: string;
}

export async function registerUser(payload: RegisterPayload): Promise<AuthUser> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? 'Ошибка регистрации');
  }

  const data = await response.json();
  return data.user;
}

export async function loginUser(email: string, password: string): Promise<AuthUser> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? 'Ошибка авторизации');
  }

  const data = await response.json();
  return data.user;
}
