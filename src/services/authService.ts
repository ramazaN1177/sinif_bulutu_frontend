import { api } from './api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'teacher' | 'student';
  avatarUrl?: string;
  school?: string;
  branch?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

function extractErrorMessage(err: any, fallback: string): string {
  const data = err?.response?.data;
  if (!data) {
    return err?.message || fallback;
  }

  // 1. If backend returned validation details array from Zod
  if (Array.isArray(data.error?.details) && data.error.details.length > 0) {
    const detailMessages = data.error.details
      .map((d: any) => d.message || d.path)
      .filter(Boolean);
    if (detailMessages.length > 0) {
      return detailMessages.join(', ');
    }
  }

  // 2. If backend returned nested error.message string
  if (typeof data.error?.message === 'string') {
    return data.error.message;
  }

  // 3. If backend returned error as a string
  if (typeof data.error === 'string') {
    return data.error;
  }

  // 4. If backend returned top-level message string
  if (typeof data.message === 'string') {
    return data.message;
  }

  return fallback;
}

export const authService = {
  async login(email: string, password: string): Promise<User> {
    try {
      const response = await api.post<any>('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      const resData = response.data?.data || response.data;
      const { user, accessToken } = resData;

      localStorage.setItem('sinif_bulutu_token', accessToken);
      localStorage.setItem('sinif_bulutu_user', JSON.stringify(user));
      window.dispatchEvent(new Event('auth_state_changed'));
      return user;
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.'));
    }
  },

  async register(params: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'teacher' | 'student';
  }): Promise<User> {
    try {
      const response = await api.post<any>('/auth/register', {
        email: params.email.trim().toLowerCase(),
        password: params.password,
        firstName: params.firstName.trim(),
        lastName: params.lastName.trim(),
        role: params.role,
      });

      const resData = response.data?.data || response.data;
      const { user, accessToken } = resData;

      localStorage.setItem('sinif_bulutu_token', accessToken);
      localStorage.setItem('sinif_bulutu_user', JSON.stringify(user));
      window.dispatchEvent(new Event('auth_state_changed'));
      return user;
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Kayıt işlemi başarısız oldu. Lütfen bilgilerinizi kontrol edin.'));
    }
  },

  async googleAuth(params: {
    email: string;
    firstName: string;
    lastName?: string;
    role: 'teacher' | 'student';
    googleId?: string;
    avatarUrl?: string;
  }): Promise<User> {
    try {
      const email = params.email.trim().toLowerCase();
      const googleId = params.googleId || `google_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const response = await api.post('/auth/google', {
        email,
        firstName: params.firstName.trim() || 'Kullanıcı',
        lastName: params.lastName?.trim() || '',
        googleId,
        role: params.role,
        avatarUrl: params.avatarUrl,
      });

      const resData = response.data?.data || response.data;
      const { user, accessToken } = resData;

      localStorage.setItem('sinif_bulutu_token', accessToken);
      localStorage.setItem('sinif_bulutu_user', JSON.stringify(user));
      window.dispatchEvent(new Event('auth_state_changed'));
      return user;
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Google ile giriş yapılamadı.'));
    }
  },

  async getMe(): Promise<User | null> {
    try {
      const token = localStorage.getItem('sinif_bulutu_token');
      if (!token) return null;
      const response = await api.get<any>('/auth/me');
      const user = response.data?.data?.user || response.data?.user;
      if (user) {
        localStorage.setItem('sinif_bulutu_user', JSON.stringify(user));
      }
      return user || null;
    } catch {
      return null;
    }
  },

  getStoredUser(): User | null {
    try {
      const data = localStorage.getItem('sinif_bulutu_user');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem('sinif_bulutu_token');
    localStorage.removeItem('sinif_bulutu_user');
    window.dispatchEvent(new Event('auth_state_changed'));
  },
};
