import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import Cookies from 'js-cookie';

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptador de request para adicionar token
    this.client.interceptors.request.use(
      config => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Interceptador de response para refresh automático
    this.client.interceptors.response.use(
      response => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosError['config'] & {
          _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = Cookies.get('refresh_token');
            if (refreshToken) {
              const response = await this.client.post('/auth/refresh', {
                refreshToken,
              });

              const { accessToken } = response.data;
              this.setAccessToken(accessToken);

              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            }
          } catch {
            // Refresh failed, redirect to login
            this.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  clearTokens() {
    this.accessToken = null;
    Cookies.remove('refresh_token');
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async verifyMfa(code: string, sessionId: string) {
    const response = await this.client.post('/auth/mfa/verify', {
      code,
      sessionId,
    });
    return response.data;
  }

  async logout() {
    try {
      const refreshToken = Cookies.get('refresh_token');
      if (refreshToken) {
        await this.client.post('/auth/logout', { refreshToken });
      }
    } finally {
      this.clearTokens();
    }
  }

  async logoutAll() {
    try {
      await this.client.post('/auth/logout-all');
    } finally {
      this.clearTokens();
    }
  }

  async forgotPassword(email: string) {
    const response = await this.client.post('/auth/password/forgot', {
      email,
    });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string) {
    const response = await this.client.post('/auth/password/reset', {
      token,
      newPassword,
    });
    return response.data;
  }

  async verifyEmail(token: string) {
    const response = await this.client.post('/auth/email/verify', {
      token,
    });
    return response.data;
  }

  async resendEmailVerification(email: string) {
    const response = await this.client.post('/auth/email/resend', {
      email,
    });
    return response.data;
  }

  // MFA endpoints
  async setupMfa() {
    const response = await this.client.get('/auth/mfa/setup');
    return response.data;
  }

  async verifyAndEnableMfa(secret: string, token: string) {
    const response = await this.client.post('/auth/mfa/setup/verify', {
      secret,
      token,
    });
    return response.data;
  }

  async disableMfa(currentPassword: string) {
    const response = await this.client.post('/auth/mfa/disable', {
      currentPassword,
    });
    return response.data;
  }

  async getMfaStatus() {
    const response = await this.client.get('/auth/mfa/status');
    return response.data;
  }

  async regenerateBackupCodes() {
    const response = await this.client.post(
      '/auth/mfa/backup-codes/regenerate'
    );
    return response.data;
  }

  // Session management
  async getSessions() {
    const response = await this.client.get('/sessions/me');
    return response.data;
  }

  async revokeSession(sessionId: string) {
    const response = await this.client.delete(`/sessions/me/${sessionId}`);
    return response.data;
  }

  async revokeOtherSessions() {
    const response = await this.client.delete('/sessions/me/others');
    return response.data;
  }

  async getDevices() {
    const response = await this.client.get('/sessions/me/devices');
    return response.data;
  }

  async getSecurityEvents() {
    const response = await this.client.get('/sessions/me/security-events');
    return response.data;
  }

  // User profile
  async getProfile() {
    const response = await this.client.get('/auth/profile');
    return response.data;
  }

  // Generic request method
  async request<T = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    data?: unknown
  ): Promise<AxiosResponse<T>> {
    return this.client.request({
      method,
      url,
      data,
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
