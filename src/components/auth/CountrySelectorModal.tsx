import React, { useState } from 'react';
import { Search, Check, X } from 'lucide-react';
import { CountryCode } from './types';
import { COUNTRY_CODES } from './countries';

interface CountrySelectorModalProps {
  selectedCountry: CountryCode;
  onSelectCountry: (country: CountryCode) => void;
  onClose: () => void;
}

export const CountrySelectorModal: React.FC<CountrySelectorModalProps> = ({
  selectedCountry,
  onSelectCountry,
  onClose,
}) => {
  const [search, setSearch] = useState('');

  const filtered = COUNTRY_CODES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="nexa-country-modal-overlay" onClick={onClose}>
      <div className="nexa-country-modal" onClick={(e) => e.stopPropagation()}>
        <div className="nexa-country-modal-header">
          <span className="nexa-country-modal-title">Select Country</span>
          <button className="nexa-auth-icon-btn" onClick={onClose} title="Close">
            <X size={16} />
          </button>
        </div>

        <div className="nexa-country-search-box">
          <Search size={16} style={{ color: 'var(--text-1)' }} />
          <input
            type="text"
            className="nexa-country-search-input"
            placeholder="Search country or dial code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="nexa-country-list">
          {filtered.map((c) => {
            const isSelected = c.code === selectedCountry.code;
            return (
              <button
                key={c.code}
                className={`nexa-country-item ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  onSelectCountry(c);
                  onClose();
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>{c.flag}</span>
                  <span>{c.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ opacity: 0.7 }}>{c.dial}</span>
                  {isSelected && <Check size={16} />}
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                color: 'var(--text-1)',
                fontSize: '13.5px',
              }}
            >
              No country matching "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
