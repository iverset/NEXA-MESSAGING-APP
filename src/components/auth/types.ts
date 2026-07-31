export type AuthStage =
  | 'splash'
  | 'intro'
  | 'get_started'
  | 'choose_method'
  | 'register'
  | 'signin_email'
  | 'signin_phone_pass'
  | 'signin_phone_otp'
  | 'otp_verify'
  | 'google_phone_link'
  | 'profile_setup'
  | 'security_recommendation'
  | 'two_step_challenge';

export type UserRole = 'super_admin' | 'user';

export interface CountryCode {
  code: string;
  name: string;
  dial: string;
  flag: string;
}

export interface AuthUserData {
  username: string;
  name: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  role?: UserRole;
  isSuperAdmin?: boolean;
}

export interface OnboardingAuthScreenProps {
  onCompleteAuth: (userData: AuthUserData) => void;
  onToast: (msg: string) => void;
  initialStage?: string;
  onClose?: () => void;
  isAuthenticated?: boolean;
}

