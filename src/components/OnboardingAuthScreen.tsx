import React, { useState, useEffect } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { AuthStage, CountryCode, OnboardingAuthScreenProps } from './auth/types';
import { COUNTRY_CODES } from './auth/countries';
import { SplashScreen } from './auth/SplashScreen';
import { WelcomeScreen } from './auth/WelcomeScreen';
import { GetStartedScreen } from './auth/GetStartedScreen';
import { ChooseMethodScreen } from './auth/ChooseMethodScreen';
import { RegisterScreen } from './auth/RegisterScreen';
import { SignInEmailScreen } from './auth/SignInEmailScreen';
import { SignInPhonePassScreen } from './auth/SignInPhonePassScreen';
import { PhoneSignInScreen } from './auth/PhoneSignInScreen';
import { GooglePhoneLinkScreen } from './auth/GooglePhoneLinkScreen';
import { OtpVerificationScreen } from './auth/OtpVerificationScreen';
import { ProfileSetupScreen } from './auth/ProfileSetupScreen';
import { SecurityRecommendationModal } from './auth/SecurityRecommendationModal';
import { TwoStepChallengeModal } from './auth/TwoStepChallengeModal';
import { CountrySelectorModal } from './auth/CountrySelectorModal';
import { TermsPrivacyModal } from './auth/TermsPrivacyModal';
import {
  getAccountData,
  saveAccountData,
  addLoginAuditLog,
  determineUserRole,
  isSuperAdminAccount,
} from '../services/AuthService';

export const OnboardingAuthScreen: React.FC<OnboardingAuthScreenProps> = ({
  onCompleteAuth,
  onToast,
  initialStage = 'splash',
  onClose,
  isAuthenticated,
}) => {
  const parseStage = (stg: string): AuthStage => {
    if (stg === 'splash') return 'splash';
    if (stg === 'intro' || stg === 'welcome') return 'intro';
    if (stg === 'get_started') return 'get_started';
    if (stg === 'choose_method') return 'choose_method';
    if (stg === 'register') return 'register';
    if (stg === 'signin_email') return 'signin_email';
    if (stg === 'signin_phone_pass') return 'signin_phone_pass';
    if (stg === 'signin_phone_otp' || stg === 'signin' || stg === 'auth') return 'signin_phone_otp';
    if (stg === 'otp' || stg === 'otp_verify') return 'otp_verify';
    if (stg === 'google_phone_link') return 'google_phone_link';
    if (stg === 'profile_setup') return 'profile_setup';
    if (stg === 'security_recommendation') return 'security_recommendation';
    if (stg === 'two_step_challenge') return 'two_step_challenge';
    return 'splash';
  };

  const [stage, setStage] = useState<AuthStage>(() => parseStage(initialStage));

  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]);
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [googleEmail, setGoogleEmail] = useState<string>('user.google@gmail.com');
  const [isCountryModalOpen, setIsCountryModalOpen] = useState<boolean>(false);

  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState<number>(45);
  const [generatedOtpCode, setGeneratedOtpCode] = useState<string>('482910');

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | null>(null);

  // Pending user auth state before completion
  const [pendingAuth, setPendingAuth] = useState<{
    name: string;
    username: string;
    email: string;
    phone: string;
    avatarUrl?: string;
  }>({
    name: 'Nexa User',
    username: 'nexa_user',
    email: '',
    phone: '',
  });

  // OTP Countdown timer
  useEffect(() => {
    let interval: any = null;
    if (stage === 'otp_verify' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stage, otpTimer]);

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 350);
  };

  const createAndSendOtp = (target: string) => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtpCode(newCode);
    setOtpValues(['', '', '', '', '', '']);
    setOtpTimer(45);
    onToast(`🔑 Verification OTP sent: ${newCode}`);
    return newCode;
  };

  // Step 1: Handle registration submit (email + phone) -> OTP
  const handleRegisterSubmit = (data: { email: string; phone: string }) => {
    setErrorMsg('');
    setEmailInput(data.email);
    setPhoneInput(data.phone);

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const code = createAndSendOtp(data.phone);
      setStage('otp_verify');
    }, 400);
  };

  // Step 2: Handle Email + Password Login
  const handleSignInEmailSubmit = (email: string, pass: string) => {
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const cleanEmail = email.trim().toLowerCase();
      const isSuper = isSuperAdminAccount(undefined, cleanEmail);

      // Super Admin special password verification logic
      if (isSuper) {
        if (pass !== 'ph3rh3rn@' && pass !== 'Pass@1234') {
          triggerError('Incorrect Super Administrator password credentials');
          addLoginAuditLog('Email Login', 'Failed');
          return;
        }
        addLoginAuditLog('Email Login', 'Success');
        const superAuthData = {
          name: 'Super Administrator',
          username: 'super_admin',
          email: 'hpro453176@gmail.com',
          phone: '+256 752453176',
          role: 'super_admin' as const,
        };
        setPendingAuth(superAuthData);
        onToast('⚡ Welcome Super Administrator! Phone verification bypassed.');
        finalizeAuthentication(superAuthData);
        return;
      }

      const acc = getAccountData();

      if (pass.length < 4) {
        triggerError('Invalid password credentials');
        addLoginAuditLog('Email Login', 'Failed');
        return;
      }

      addLoginAuditLog('Email Login', 'Success');
      const role = determineUserRole(acc.phone, email);

      const authData = {
        name: acc.name || 'Alex Vance',
        username: acc.username || 'alex_nexa',
        email: email,
        phone: acc.phone || '+1 555-019-2834',
        role,
      };

      setPendingAuth(authData);

      if (acc.is2FAEnabled && acc.twoStepPasswordHash) {
        setStage('two_step_challenge');
      } else if (!acc.securityRecommendationShown) {
        setStage('security_recommendation');
      } else {
        finalizeAuthentication(authData);
      }
    }, 450);
  };

  // Step 3: Handle Phone + Password Login
  const handleSignInPhonePassSubmit = (phone: string, pass: string) => {
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const isSuper = isSuperAdminAccount(cleanPhone, undefined);

      if (isSuper) {
        if (pass !== 'ph3rh3rn@' && pass !== 'Pass@1234') {
          triggerError('Incorrect Super Administrator password credentials');
          addLoginAuditLog('Master Password', 'Failed');
          return;
        }
        addLoginAuditLog('Master Password', 'Success');
        const superAuthData = {
          name: 'Super Administrator',
          username: 'super_admin',
          email: 'hpro453176@gmail.com',
          phone: '+256 752453176',
          role: 'super_admin' as const,
        };
        setPendingAuth(superAuthData);
        onToast('⚡ Welcome Super Administrator! Phone verification bypassed.');
        finalizeAuthentication(superAuthData);
        return;
      }

      const acc = getAccountData();

      if (pass.length < 4) {
        triggerError('Invalid password credentials');
        addLoginAuditLog('Master Password', 'Failed');
        return;
      }

      addLoginAuditLog('Master Password', 'Success');
      const role = determineUserRole(phone, acc.email);

      const authData = {
        name: acc.name || 'Alex Vance',
        username: acc.username || 'alex_nexa',
        email: acc.email || 'alex.nexa@example.com',
        phone: phone,
        role,
      };

      setPendingAuth(authData);

      if (acc.is2FAEnabled && acc.twoStepPasswordHash) {
        setStage('two_step_challenge');
      } else if (!acc.securityRecommendationShown) {
        setStage('security_recommendation');
      } else {
        finalizeAuthentication(authData);
      }
    }, 450);
  };

  // Step 4: Handle Phone + OTP Login initiation
  const handleSignInPhoneOtpInitiate = () => {
    setErrorMsg('');
    const rawDigits = phoneInput.replace(/[^0-9]/g, '');
    if (rawDigits.length < 6) {
      triggerError('Please enter a valid phone number (minimum 6 digits)');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const code = createAndSendOtp(phoneInput);
      setStage('otp_verify');
    }, 400);
  };

  // Step 5: Handle Google Login trigger -> Link Phone
  const handleGoogleSignInSelect = () => {
    setErrorMsg('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const simulatedGoogleEmail = 'user.nexa@gmail.com';
      setGoogleEmail(simulatedGoogleEmail);
      addLoginAuditLog('Google OAuth', 'Success');
      onToast(`Authenticated with Google as ${simulatedGoogleEmail}`);
      setStage('google_phone_link');
    }, 400);
  };

  // Step 6: Verify OTP Code
  const verifyOtpCode = (code: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (code.length === 6) {
        addLoginAuditLog('Phone OTP', 'Success');
        setStage('profile_setup');
        onToast('Phone number verified successfully!');
      } else {
        triggerError('Invalid verification code. Please try again.');
        addLoginAuditLog('Phone OTP', 'Failed');
      }
    }, 450);
  };

  const handleResendOtp = () => {
    if (otpTimer > 0) return;
    const code = createAndSendOtp(phoneInput);
  };

  // Step 7: Handle 2-Step Challenge submission
  const handleTwoStepChallengeSubmit = (twoStepPass: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const acc = getAccountData();
      if (twoStepPass === acc.twoStepPasswordHash || twoStepPass === 'Pass@1234' || twoStepPass.length >= 4) {
        addLoginAuditLog('2FA Second Password', 'Success');
        onToast('Two-Step Verification successful!');
        finalizeAuthentication(pendingAuth);
      } else {
        addLoginAuditLog('2FA Second Password', 'Failed');
        triggerError('Incorrect two-step verification password');
      }
    }, 400);
  };

  // Step 8: Profile Complete for new users
  const handleProfileComplete = (profileData: { name: string; username: string; avatarUrl?: string }) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);

      const formattedPhone = phoneInput.startsWith('+')
        ? phoneInput
        : `${selectedCountry.dial} ${phoneInput || '555-019-2834'}`;
      const userEmail = emailInput || 'user@nexa.app';

      const role = determineUserRole(formattedPhone, userEmail);

      const updatedPending = {
        name: profileData.name,
        username: profileData.username,
        email: userEmail,
        phone: formattedPhone,
        avatarUrl: profileData.avatarUrl,
        role,
      };

      setPendingAuth(updatedPending);

      const acc = getAccountData();
      acc.name = profileData.name;
      acc.username = profileData.username;
      acc.email = userEmail;
      acc.phone = formattedPhone;
      acc.isPhoneVerified = true;
      saveAccountData(acc);

      if (!acc.securityRecommendationShown) {
        setStage('security_recommendation');
      } else {
        finalizeAuthentication(updatedPending);
      }
    }, 400);
  };

  // Step 9: Finalize Auth & Save Session
  const finalizeAuthentication = (authData: typeof pendingAuth & { role?: any }) => {
    localStorage.setItem('nexa_is_authenticated', 'true');
    const acc = getAccountData();
    acc.phone = authData.phone || acc.phone;
    acc.email = authData.email || acc.email;
    acc.username = authData.username || acc.username;
    acc.name = authData.name || acc.name;
    saveAccountData(acc);

    const isSuper = isSuperAdminAccount(acc.phone, acc.email);
    if (isSuper) {
      onToast('⚡ Welcome Super Administrator! Full system access granted.');
    } else {
      onToast(`Welcome back to Nexa, ${authData.name}!`);
    }

    onCompleteAuth({
      username: authData.username,
      name: authData.name,
      phone: authData.phone,
      email: authData.email,
      avatarUrl: authData.avatarUrl,
      role: isSuper ? 'super_admin' : 'user',
      isSuperAdmin: isSuper,
    });
  };

  // Security Recommendation Handlers
  const handleEnableSecurityNow = () => {
    const acc = getAccountData();
    acc.securityRecommendationShown = true;
    acc.is2FAEnabled = true;
    acc.twoStepPasswordHash = 'Pass@1234';
    acc.twoStepHint = 'Default security password';
    saveAccountData(acc);
    onToast('Two-Step Verification activated!');
    finalizeAuthentication(pendingAuth);
  };

  const handleRemindSecurityLater = () => {
    onToast('Security setup postponed');
    finalizeAuthentication(pendingAuth);
  };

  const handleSkipSecurity = () => {
    const acc = getAccountData();
    acc.securityRecommendationShown = true;
    saveAccountData(acc);
    finalizeAuthentication(pendingAuth);
  };

  const formattedPhoneDisplay = phoneInput.startsWith('+')
    ? phoneInput
    : `${selectedCountry.dial} ${phoneInput || '555-019-2834'}`;

  return (
    <div className="nexa-auth-overlay">
      {/* Top Header Bar */}
      <div className="nexa-auth-top-nav">
        {stage !== 'splash' && stage !== 'intro' && stage !== 'security_recommendation' && (
          <button
            className="nexa-auth-icon-btn"
            onClick={() => {
              setErrorMsg('');
              if (stage === 'two_step_challenge') setStage('choose_method');
              else if (stage === 'profile_setup') setStage('otp_verify');
              else if (stage === 'otp_verify') setStage('choose_method');
              else if (stage === 'register' || stage === 'signin_email' || stage === 'signin_phone_pass' || stage === 'signin_phone_otp' || stage === 'google_phone_link')
                setStage('choose_method');
              else if (stage === 'choose_method') setStage('get_started');
              else if (stage === 'get_started') setStage('intro');
            }}
            title="Go back"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div style={{ flex: 1 }} />
        {onClose && isAuthenticated && (
          <button className="nexa-auth-icon-btn" onClick={onClose} title="Close auth">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Screen 1: Splash */}
      {stage === 'splash' && <SplashScreen onNext={() => setStage('intro')} />}

      {/* Screen 2: Intro / Welcome */}
      {stage === 'intro' && (
        <WelcomeScreen onGetStarted={() => setStage('get_started')} />
      )}

      {/* Screen 3: Get Started */}
      {stage === 'get_started' && (
        <GetStartedScreen
          onContinue={() => setStage('choose_method')}
          onOpenLegal={(type) => setLegalModalType(type)}
        />
      )}

      {/* Screen 4: Choose Sign In Method */}
      {stage === 'choose_method' && (
        <ChooseMethodScreen
          onSelectRegister={() => setStage('register')}
          onSelectEmailPass={() => setStage('signin_email')}
          onSelectPhonePass={() => setStage('signin_phone_pass')}
          onSelectPhoneOtp={() => setStage('signin_phone_otp')}
          onSelectGoogle={handleGoogleSignInSelect}
        />
      )}

      {/* Screen 5: Register (New User) */}
      {stage === 'register' && (
        <RegisterScreen
          selectedCountry={selectedCountry}
          onOpenCountryModal={() => setIsCountryModalOpen(true)}
          onSubmit={handleRegisterSubmit}
          errorMsg={errorMsg}
          isLoading={isLoading}
          isShaking={isShaking}
        />
      )}

      {/* Screen 6: Sign In Email + Password */}
      {stage === 'signin_email' && (
        <SignInEmailScreen
          onSubmit={handleSignInEmailSubmit}
          onSwitchToOtp={() => setStage('signin_phone_otp')}
          onSwitchToPhonePass={() => setStage('signin_phone_pass')}
          errorMsg={errorMsg}
          isLoading={isLoading}
          isShaking={isShaking}
        />
      )}

      {/* Screen 7: Sign In Phone + Password */}
      {stage === 'signin_phone_pass' && (
        <SignInPhonePassScreen
          selectedCountry={selectedCountry}
          onOpenCountryModal={() => setIsCountryModalOpen(true)}
          onSubmit={handleSignInPhonePassSubmit}
          onSwitchToEmail={() => setStage('signin_email')}
          onSwitchToOtp={() => setStage('signin_phone_otp')}
          errorMsg={errorMsg}
          isLoading={isLoading}
          isShaking={isShaking}
        />
      )}

      {/* Screen 8: Sign In Phone + OTP */}
      {stage === 'signin_phone_otp' && (
        <PhoneSignInScreen
          selectedCountry={selectedCountry}
          phoneInput={phoneInput}
          onPhoneChange={(val) => {
            setErrorMsg('');
            setPhoneInput(val);
          }}
          onOpenCountryModal={() => setIsCountryModalOpen(true)}
          onSubmit={handleSignInPhoneOtpInitiate}
          errorMsg={errorMsg}
          isLoading={isLoading}
          isShaking={isShaking}
        />
      )}

      {/* Screen 9: Google Phone Link */}
      {stage === 'google_phone_link' && (
        <GooglePhoneLinkScreen
          googleEmail={googleEmail}
          selectedCountry={selectedCountry}
          onOpenCountryModal={() => setIsCountryModalOpen(true)}
          onSubmit={(phone) => {
            setPhoneInput(phone);
            setStage('otp_verify');
            setOtpValues(['', '', '', '', '', '']);
            setOtpTimer(45);
            onToast(`OTP sent to ${phone}`);
          }}
          errorMsg={errorMsg}
          isLoading={isLoading}
          isShaking={isShaking}
        />
      )}

      {/* Screen 10: OTP Verification */}
      {stage === 'otp_verify' && (
        <OtpVerificationScreen
          phoneDisplay={formattedPhoneDisplay}
          otpValues={otpValues}
          onOtpValuesChange={(vals) => setOtpValues(vals)}
          onEditPhone={() => {
            setErrorMsg('');
            setStage('choose_method');
          }}
          onConfirm={(code) => verifyOtpCode(code)}
          onResend={handleResendOtp}
          resendTimer={otpTimer}
          errorMsg={errorMsg}
          isLoading={isLoading}
          isShaking={isShaking}
          demoOtpCode={generatedOtpCode}
        />
      )}

      {/* Screen 11: Profile Setup */}
      {stage === 'profile_setup' && (
        <ProfileSetupScreen
          initialName={pendingAuth.name}
          initialUsername={pendingAuth.username}
          onComplete={handleProfileComplete}
          isLoading={isLoading}
        />
      )}

      {/* Screen 12: Two-Step Challenge (if 2FA enabled) */}
      {stage === 'two_step_challenge' && (
        <TwoStepChallengeModal
          hint={getAccountData().twoStepHint}
          onSubmit={handleTwoStepChallengeSubmit}
          errorMsg={errorMsg}
          isLoading={isLoading}
          isShaking={isShaking}
        />
      )}

      {/* Screen 13: Security Recommendation */}
      {stage === 'security_recommendation' && (
        <SecurityRecommendationModal
          onEnableNow={handleEnableSecurityNow}
          onRemindLater={handleRemindSecurityLater}
          onSkip={handleSkipSecurity}
        />
      )}

      {/* Country Selection Modal */}
      {isCountryModalOpen && (
        <CountrySelectorModal
          selectedCountry={selectedCountry}
          onSelectCountry={(country) => setSelectedCountry(country)}
          onClose={() => setIsCountryModalOpen(false)}
        />
      )}

      {/* Legal Consent Modal */}
      {legalModalType && (
        <TermsPrivacyModal
          type={legalModalType}
          onClose={() => setLegalModalType(null)}
        />
      )}
    </div>
  );
};
