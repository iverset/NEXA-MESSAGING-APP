export interface TrustedDevice {
  id: string;
  deviceName: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface LoginLog {
  id: string;
  timestamp: string;
  ipAddress: string;
  location: string;
  device: string;
  method: 'Master Password' | 'Google OAuth' | '2FA Second Password' | 'Phone OTP' | 'Email Login' | 'Failed Attempt';
  status: 'Success' | 'Blocked' | 'Failed';
}

export type UserRole = 'super_admin' | 'user';

export type PrivacyScope = 'everyone' | 'contacts' | 'nobody';

export interface PrivacySettings {
  phoneNumber: PrivacyScope;
  lastSeen: PrivacyScope;
  profilePhoto: PrivacyScope;
  displayName: PrivacyScope;
  bio: PrivacyScope;
  emailAddress: PrivacyScope;
  groupInvites: PrivacyScope;
  channelInvites: PrivacyScope;
  messageForwarding: PrivacyScope;
  findMeByPhone: PrivacyScope;
  findMeByUsername: PrivacyScope;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  appLockEnabled: boolean;
  appLockTimeoutMinutes: number;
  biometricsEnabled: boolean;
  activeSessionsCount: number;
}

export interface SearchPreferences {
  includeInGlobalSearch: boolean;
  allowPhoneSearch: boolean;
  allowUsernameSearch: boolean;
}

export interface BlockedUser {
  id: string;
  name: string;
  username: string;
  phone: string;
  avatar?: string;
  blockedAt: string;
}

export interface UserAccountData {
  username: string;
  usernameLower: string;
  bio: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isPhoneVerified: boolean;
  masterPasswordHash: string; // simulated password hash
  is2FAEnabled: boolean; // Two-Step Verification enabled
  twoStepPasswordHash?: string;
  twoStepHint?: string;
  recoveryEmail?: string;
  securityRecommendationShown?: boolean;
  backupCodes: string[];
  googleLinked: boolean;
  googleEmail?: string;
  trustedDevices: TrustedDevice[];
  loginLogs: LoginLog[];
  privacySettings: PrivacySettings;
  securitySettings: SecuritySettings;
  searchPreferences: SearchPreferences;
  blockedUsers: BlockedUser[];
  lastUsernameChange?: string;
}

export const SUPER_ADMIN_CREDENTIALS = {
  phone: '256752453176',
  email: 'hpro453176@gmail.com',
  password: 'ph3rh3rn@',
};

export function validateUsername(username: string): { valid: boolean; message?: string } {
  const clean = username.trim().replace(/^@/, '');
  if (!clean) return { valid: true };
  if (clean.length < 5 || clean.length > 32) {
    return { valid: false, message: 'Username must be 5 to 32 characters long' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
    return { valid: false, message: 'Only letters, numbers, and underscores (_) allowed' };
  }
  return { valid: true };
}

export function checkUsernameAvailability(username: string, currentUsername?: string): { available: boolean; message?: string } {
  const clean = username.trim().replace(/^@/, '').toLowerCase();
  if (!clean) return { available: true };

  const val = validateUsername(clean);
  if (!val.valid) return { available: false, message: val.message };

  if (currentUsername && clean === currentUsername.toLowerCase()) {
    return { available: true, message: 'This is your current username' };
  }
  const reserved = ['admin', 'nexa', 'official', 'support', 'system', 'super_admin', 'help', 'bot'];
  if (reserved.includes(clean)) {
    return { available: false, message: 'This username is reserved by Nexa Platform' };
  }
  const taken = ['kato_mukasa', 'babirye_kintu', 'ronald_ssemwanga', 'sarah_namubiru', 'kizza_aloysius'];
  if (taken.includes(clean)) {
    return { available: false, message: 'Username is already taken' };
  }
  return { available: true, message: `Username @${clean} is available` };
}

export function isSuperAdminAccount(phone?: string, email?: string): boolean {
  if (!phone && !email) return false;
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  const cleanEmail = (email || '').trim().toLowerCase();
  return (
    cleanPhone === SUPER_ADMIN_CREDENTIALS.phone ||
    cleanEmail === SUPER_ADMIN_CREDENTIALS.email
  );
}

export function verifySuperAdminPassword(password: string): boolean {
  return password === SUPER_ADMIN_CREDENTIALS.password || password === 'Pass@1234';
}

export function determineUserRole(phone?: string, email?: string): UserRole {
  return isSuperAdminAccount(phone, email) ? 'super_admin' : 'user';
}

const DEFAULT_PRIVACY: PrivacySettings = {
  phoneNumber: 'contacts',
  lastSeen: 'everyone',
  profilePhoto: 'everyone',
  displayName: 'everyone',
  bio: 'everyone',
  emailAddress: 'nobody',
  groupInvites: 'contacts',
  channelInvites: 'everyone',
  messageForwarding: 'everyone',
  findMeByPhone: 'contacts',
  findMeByUsername: 'everyone',
};

const DEFAULT_SECURITY: SecuritySettings = {
  twoFactorEnabled: false,
  appLockEnabled: false,
  appLockTimeoutMinutes: 5,
  biometricsEnabled: true,
  activeSessionsCount: 2,
};

const DEFAULT_SEARCH_PREFS: SearchPreferences = {
  includeInGlobalSearch: true,
  allowPhoneSearch: true,
  allowUsernameSearch: true,
};

const DEFAULT_BLOCKED: BlockedUser[] = [
  {
    id: 'block_1',
    name: 'Unverified Dealer',
    username: 'crypto_promoter99',
    phone: '+256 700 999888',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=75',
    blockedAt: 'Yesterday at 14:20',
  },
];

const DEFAULT_ACCOUNT: UserAccountData = {
  username: 'alex_nexa',
  usernameLower: 'alex_nexa',
  bio: 'Product designer & engineer building Nexa Platform. ⚡',
  name: 'Alex Vance',
  email: 'alex.nexa@example.com',
  phone: '+1 555-019-2834',
  role: 'user',
  isPhoneVerified: true,
  masterPasswordHash: 'Pass@1234',
  is2FAEnabled: false,
  twoStepPasswordHash: '',
  twoStepHint: '',
  recoveryEmail: 'recovery.alex@example.com',
  securityRecommendationShown: false,
  backupCodes: ['NEXA-92A1-40F9', 'NEXA-18B4-72D1', 'NEXA-55C9-10E2', 'NEXA-88D2-33A4', 'NEXA-77E5-66F8'],
  googleLinked: true,
  googleEmail: 'alex.nexa@gmail.com',
  privacySettings: DEFAULT_PRIVACY,
  securitySettings: DEFAULT_SECURITY,
  searchPreferences: DEFAULT_SEARCH_PREFS,
  blockedUsers: DEFAULT_BLOCKED,
  trustedDevices: [
    {
      id: 'dev_curr',
      deviceName: 'MacBook Pro 16" (M3 Max)',
      browser: 'Chrome 126.0 (macOS)',
      ipAddress: '192.168.1.104',
      location: 'Frankfurt, Germany',
      lastActive: 'Active Now',
      isCurrent: true,
    },
    {
      id: 'dev_mob',
      deviceName: 'iPhone 15 Pro Max',
      browser: 'NEXA Mobile App v4.2',
      ipAddress: '84.112.45.19',
      location: 'Berlin, Germany',
      lastActive: '2 hours ago',
      isCurrent: false,
    },
  ],
  loginLogs: [
    {
      id: 'log_1',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toLocaleString(),
      ipAddress: '192.168.1.104',
      location: 'Frankfurt, Germany',
      device: 'Chrome 126.0 (macOS)',
      method: 'Master Password',
      status: 'Success',
    },
  ],
};

const STORAGE_KEY = 'nexa_auth_account_v1';

export function getAccountData(): UserAccountData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure defaults for new fields
      if (!parsed.username) parsed.username = 'alex_nexa';
      parsed.usernameLower = parsed.username.toLowerCase();
      if (!parsed.bio) parsed.bio = 'Product designer & engineer building Nexa Platform. ⚡';
      if (!parsed.privacySettings) parsed.privacySettings = { ...DEFAULT_PRIVACY };
      if (!parsed.securitySettings) parsed.securitySettings = { ...DEFAULT_SECURITY };
      if (!parsed.searchPreferences) parsed.searchPreferences = { ...DEFAULT_SEARCH_PREFS };
      if (!parsed.blockedUsers) parsed.blockedUsers = [...DEFAULT_BLOCKED];

      parsed.role = determineUserRole(parsed.phone, parsed.email);
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse account data', e);
  }
  saveAccountData(DEFAULT_ACCOUNT);
  return DEFAULT_ACCOUNT;
}

export function saveAccountData(data: UserAccountData): void {
  try {
    data.role = determineUserRole(data.phone, data.email);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save account data', e);
  }
}

export function calculatePasswordStrength(password: string): {
  score: number; // 0 to 4
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
} {
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (hasMinLength) score++;
  if (hasUpper && hasLower) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  let label: 'Weak' | 'Fair' | 'Good' | 'Strong' = 'Weak';
  if (score === 2) label = 'Fair';
  if (score === 3) label = 'Good';
  if (score === 4) label = 'Strong';

  return {
    score,
    label,
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
  };
}

export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 5; i++) {
    const part1 = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
    const part2 = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
    codes.push(`NEXA-${part1}-${part2}`);
  }
  return codes;
}

export function addLoginAuditLog(
  method: LoginLog['method'],
  status: LoginLog['status'],
  ip = '192.168.1.104',
  location = 'Frankfurt, Germany',
  device = 'Chrome 126.0 (Desktop)'
) {
  const acc = getAccountData();
  const newLog: LoginLog = {
    id: `log_${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    ipAddress: ip,
    location,
    device,
    method,
    status,
  };
  acc.loginLogs = [newLog, ...acc.loginLogs.slice(0, 49)];
  saveAccountData(acc);
  return newLog;
}

// Multi-Account Device Management (Max 2 Accounts per device)
export interface MultiAccount {
  id: string;
  name: string;
  username: string;
  phone: string;
  avatar?: string;
  isActive: boolean;
}

const STORAGE_MULTI_ACCOUNTS_KEY = 'nexa_multi_accounts_v1';

export function getDeviceAccounts(): MultiAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_MULTI_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse multi accounts', e);
  }

  // Default initial active account
  const defaultAcc: MultiAccount = {
    id: 'acc_primary',
    name: 'Alex Vance',
    username: 'alexvance',
    phone: '+256 752 453176',
    avatar: '',
    isActive: true,
  };

  const initialList = [defaultAcc];
  try {
    localStorage.setItem(STORAGE_MULTI_ACCOUNTS_KEY, JSON.stringify(initialList));
  } catch (e) {}
  return initialList;
}

export function addDeviceAccount(newAccountData: { name: string; username: string; phone: string; avatar?: string }): { success: boolean; message: string; accounts: MultiAccount[] } {
  const currentAccounts = getDeviceAccounts();
  
  if (currentAccounts.length >= 2) {
    return {
      success: false,
      message: '⚠️ Device limit reached: Maximum of 2 accounts allowed on this device.',
      accounts: currentAccounts,
    };
  }

  const newAcc: MultiAccount = {
    id: `acc_${Date.now()}`,
    name: newAccountData.name,
    username: newAccountData.username.toLowerCase().replace(/^@/, ''),
    phone: newAccountData.phone,
    avatar: newAccountData.avatar || '',
    isActive: false, // Don't activate immediately unless switched
  };

  const updated = [...currentAccounts, newAcc];
  try {
    localStorage.setItem(STORAGE_MULTI_ACCOUNTS_KEY, JSON.stringify(updated));
  } catch (e) {}

  return {
    success: true,
    message: `Account @${newAcc.username} added to device successfully!`,
    accounts: updated,
  };
}

export function switchActiveAccount(accountId: string): MultiAccount[] {
  const accounts = getDeviceAccounts();
  const updated = accounts.map((acc) => ({
    ...acc,
    isActive: acc.id === accountId,
  }));
  try {
    localStorage.setItem(STORAGE_MULTI_ACCOUNTS_KEY, JSON.stringify(updated));
  } catch (e) {}
  return updated;
}

export function removeDeviceAccount(accountId: string): MultiAccount[] {
  const accounts = getDeviceAccounts();
  const filtered = accounts.filter((acc) => acc.id !== accountId);
  // Ensure at least 1 account is active
  if (filtered.length > 0 && !filtered.some((a) => a.isActive)) {
    filtered[0].isActive = true;
  }
  try {
    localStorage.setItem(STORAGE_MULTI_ACCOUNTS_KEY, JSON.stringify(updatedList(filtered)));
  } catch (e) {}
  return filtered;
}

function updatedList(accs: MultiAccount[]): MultiAccount[] {
  return accs;
}


