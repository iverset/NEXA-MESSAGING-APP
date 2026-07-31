import React, { useState } from 'react';
import { Camera, User, Loader2, Sparkles, Check, X, AtSign } from 'lucide-react';
import { checkUsernameAvailability, validateUsername } from '../../services/AuthService';

interface ProfileSetupScreenProps {
  initialName?: string;
  initialUsername?: string;
  onComplete: (data: { name: string; username: string; avatarUrl?: string }) => void;
  isLoading: boolean;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
];

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({
  initialName = '',
  initialUsername = '',
  onComplete,
  isLoading,
}) => {
  const [name, setName] = useState(initialName || 'Alex Vance');
  const [username, setUsername] = useState(initialUsername || 'alex_nexa');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);

  const cleanUsername = username.trim().replace(/^@/, '');
  const availability = checkUsernameAvailability(cleanUsername, initialUsername);
  const isValidFormat = validateUsername(cleanUsername).valid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (cleanUsername && !availability.available) return;

    onComplete({
      name: name.trim(),
      username: cleanUsername || `user_${Math.floor(1000 + Math.random() * 9000)}`,
      avatarUrl: selectedAvatar,
    });
  };

  const handleSkipUsername = () => {
    if (!name.trim()) return;
    onComplete({
      name: name.trim(),
      username: `user_${Math.floor(1000 + Math.random() * 9000)}`,
      avatarUrl: selectedAvatar,
    });
  };

  return (
    <div className="nexa-auth-card">
      <div className="nexa-auth-logo-icon">
        <Sparkles size={28} />
      </div>

      <h1 className="nexa-auth-title">Set up your profile</h1>
      <p className="nexa-auth-subtitle">
        Choose your display name and create a username so people can find you without knowing your phone number.
      </p>

      {/* Avatar selection */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
        <div
          style={{
            position: 'relative',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid #2AABEE',
            marginBottom: '10px',
          }}
        >
          <img
            src={selectedAvatar}
            alt="Profile Avatar"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {PRESET_AVATARS.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedAvatar(url)}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: selectedAvatar === url ? '2px solid #2AABEE' : '1px solid rgba(255,255,255,0.2)',
                padding: 0,
                cursor: 'pointer',
              }}
            >
              <img src={url} alt={`Avatar ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      </div>

      <form className="nexa-auth-form" onSubmit={handleSubmit}>
        <div style={{ textAlign: 'left' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '4px', display: 'block' }}>
            Display Name <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div className="nexa-phone-input-row" style={{ paddingLeft: '12px' }}>
            <User size={16} style={{ color: '#2AABEE' }} />
            <input
              type="text"
              className="nexa-phone-input"
              placeholder="e.g. Alex Vance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ textAlign: 'left', marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-1)' }}>
              Username <span style={{ fontSize: '11px', fontWeight: 400, color: '#8E8E93' }}>(Optional)</span>
            </label>
            {cleanUsername.length > 0 && (
              <span style={{ fontSize: '11px', color: availability.available ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                {availability.available ? '✓ Available' : '✕ Taken'}
              </span>
            )}
          </div>
          <div className="nexa-phone-input-row" style={{ paddingLeft: '12px' }}>
            <AtSign size={16} style={{ color: '#2AABEE' }} />
            <input
              type="text"
              className="nexa-phone-input"
              placeholder="e.g. alex_nexa"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            />
          </div>
          {cleanUsername.length > 0 && (
            <div
              style={{
                fontSize: '11.5px',
                marginTop: '4px',
                color: availability.available ? '#10B981' : '#EF4444',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {availability.available ? <Check size={13} /> : <X size={13} />}
              <span>{availability.message}</span>
            </div>
          )}
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '4px', lineHeight: 1.3 }}>
            People will be able to search and message you using @{cleanUsername || 'username'} without revealing your phone number.
          </p>
        </div>

        <button
          type="submit"
          className="nexa-auth-btn-primary"
          disabled={!name.trim() || (cleanUsername.length > 0 && !availability.available) || isLoading}
          style={{ marginTop: '16px' }}
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Complete Profile & Continue'}
        </button>

        <button
          type="button"
          onClick={handleSkipUsername}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#8E8E93',
            fontSize: '12px',
            marginTop: '10px',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Skip username creation for now
        </button>
      </form>
    </div>
  );
};
