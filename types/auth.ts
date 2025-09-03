// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  requiresMfa: boolean;
  sessionId?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
}

export interface MfaVerificationRequest {
  code: string;
  sessionId: string;
}

export interface MfaVerificationResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  isMfaEnabled: boolean;
  roles: Role[];
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  action: string;
  resource: string;
  description?: string;
}

// MFA types
export interface MfaSetupResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface MfaSetupVerificationRequest {
  secret: string;
  token: string;
}

export interface MfaDisableRequest {
  currentPassword: string;
}

export interface MfaStatusResponse {
  isEnabled: boolean;
  backupCodesRemaining: number;
}

export interface BackupCodesResponse {
  backupCodes: string[];
}

// Session types
export interface Session {
  id: string;
  userId: string;
  deviceName: string;
  deviceType: string;
  browser?: string;
  operatingSystem?: string;
  ipAddress: string;
  location?: string;
  isCurrentSession: boolean;
  createdAt: string;
  lastAccessedAt: string;
  expiresAt: string;
}

export interface Device {
  id: string;
  name: string;
  type: string;
  browser?: string;
  operatingSystem?: string;
  lastUsedAt: string;
  isTrusted: boolean;
  sessionsCount: number;
}

export interface SecurityEvent {
  id: string;
  userId: string;
  type: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'DETECTED' | 'VERIFIED' | 'BLOCKED';
  createdAt: string;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface MfaFormData {
  code: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// API Error types
export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Query types for React Query
export interface QueryResult<T> {
  data?: T;
  error?: ApiError;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

// Device fingerprint
export interface DeviceFingerprint {
  userAgent: string;
  platform: string;
  language: string;
  timezone: string;
  screen: {
    width: number;
    height: number;
    colorDepth: number;
  };
  canvas?: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  login: (credentials: LoginFormData) => Promise<LoginResponse>;
  verifyMfa: (data: MfaFormData, sessionId: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  isLoading: boolean;
}
