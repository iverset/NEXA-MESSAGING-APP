import React from 'react';
import { AppSection } from '../types';
import { getUIText } from '../services/translator';

interface RailNavProps {
  activeSection: AppSection;
  onSelectSection: (sec: AppSection) => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  userInitials: string;
  userAvatarUrl?: string;
  isHiddenOnMobile?: boolean;
  interfaceLang?: string;
}

const railIcons: Record<AppSection, React.ReactNode> = {
  chats: <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>,
  groups: (
    <>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </>
  ),
  channels: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>,
  communities: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </>
  ),
  mail: (
    <>
      <path d="M4 4h16v16H4z"/>
      <path d="M22 6l-10 7L2 6"/>
    </>
  ),
  stories: (
    <>
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7v5l3 3"/>
    </>
  ),
};

const railOrder: AppSection[] = ['chats', 'groups', 'channels', 'communities', 'mail', 'stories'];
const railBadges: Partial<Record<AppSection, boolean>> = { chats: true, mail: true };

export const RailNav: React.FC<RailNavProps> = ({
  activeSection,
  onSelectSection,
  onOpenSettings,
  onOpenProfile,
  userInitials,
  userAvatarUrl,
  isHiddenOnMobile,
  interfaceLang = 'en',
}) => {
  return (
    <div className={`rail ${isHiddenOnMobile ? 'hide-mobile' : ''}`}>
      <div className="logo" title="NEXA Platform">
        <svg viewBox="0 0 48 48" fill="none" style={{ filter: 'drop-shadow(0 0 6px rgba(0,240,255,0.7)) drop-shadow(0 0 10px rgba(180,38,255,0.6))' }}>
          <defs>
            <linearGradient id="neonNexaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="50%" stopColor="#9000FF" />
              <stop offset="100%" stopColor="#D000FF" />
            </linearGradient>
          </defs>
          {/* Chat box outer frame with open tail */}
          <path
            d="M 12 8 H 32 C 36 8 39 11 39 15 V 20 M 39 28 V 31 C 39 35 36 38 32 38 H 15 L 9 43 V 38 H 12 C 8 38 5 35 5 31 V 15 C 5 11 8 8 12 8 Z"
            stroke="url(#neonNexaGrad)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Interlocking loop extending into right arrow */}
          <path
            d="M 11 25 C 11 19 18 17 22 22 L 26 26 C 30 31 37 29 37 23 H 29 C 27 23 25 21 23 18 L 19 14 C 15 10 9 13 9 18 C 9 22 13 25 17 25 H 41 L 35 19 M 41 25 L 35 31"
            stroke="url(#neonNexaGrad)"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="rail-nav">
        {railOrder.map((sec) => (
          <div
            key={sec}
            className={`rail-btn ${activeSection === sec ? 'active' : ''}`}
            onClick={() => onSelectSection(sec)}
            title={getUIText(sec, interfaceLang)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              {railIcons[sec]}
            </svg>
            {railBadges[sec] && <div className="dot" />}
          </div>
        ))}
      </div>

      <div className="rail-bottom">
        <div className="rail-btn" onClick={onOpenSettings} title={getUIText('settings', interfaceLang)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9c.23.5.7.85 1.25 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </div>
        <div
          className="rail-avatar"
          onClick={onOpenProfile}
          title={getUIText('myAccount', interfaceLang)}
          style={{ overflow: 'hidden', padding: 0 }}
        >
          {userAvatarUrl && !userAvatarUrl.startsWith('linear') ? (
            <img src={userAvatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          ) : (
            userInitials || 'You'
          )}
        </div>
      </div>
    </div>
  );
};
