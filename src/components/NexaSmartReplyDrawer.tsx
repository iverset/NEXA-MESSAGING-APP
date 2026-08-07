import React, { useState, useEffect } from 'react';
import { Smile, Briefcase, Zap, Sparkles, SmilePlus, Heart, RefreshCw, Copy, Wand2 } from 'lucide-react';
import { generateNexaSmartReplies } from '../services/GreatMindsAIService';
import { GreatMindsRing } from './GreatMindsRing';

interface NexaSmartReplyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReply: (replyText: string) => void;
  contextMessages: { sender: string; text: string }[];
  roomName?: string;
  onToast?: (msg: string) => void;
}

const TONES = [
  { id: 'friendly', label: 'Friendly', icon: <Smile size={15} /> },
  { id: 'professional', label: 'Professional', icon: <Briefcase size={15} /> },
  { id: 'concise', label: 'Concise', icon: <Zap size={15} /> },
  { id: 'enthusiastic', label: 'Enthusiastic', icon: <Sparkles size={15} /> },
  { id: 'witty', label: 'Witty', icon: <SmilePlus size={15} /> },
  { id: 'empathetic', label: 'Empathetic', icon: <Heart size={15} /> },
];

export const NexaSmartReplyDrawer: React.FC<NexaSmartReplyDrawerProps> = ({
  isOpen,
  onClose,
  onSelectReply,
  contextMessages,
  roomName,
  onToast,
}) => {
  const [selectedTone, setSelectedTone] = useState<string>('friendly');
  const [customInstruction, setCustomInstruction] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedDraft, setGeneratedDraft] = useState<string>('');
  const [quickOptions, setQuickOptions] = useState<string[]>([]);

  // Auto-generate on open or tone change
  const handleGenerate = async (tone: string = selectedTone, instruction: string = customInstruction) => {
    setIsLoading(true);
    try {
      const res = await generateNexaSmartReplies(contextMessages, tone, instruction);
      setGeneratedDraft(res.mainReply);
      setQuickOptions(res.options);
    } catch (err) {
      console.error('Failed to generate smart replies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleGenerate(selectedTone, customInstruction);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          maxHeight: '85vh',
          backgroundColor: '#161922',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#F1F1F4',
        }}
      >
        {/* Handle Bar */}
        <div style={{ padding: '12px 0 4px', display: 'flex', justifyContent: 'center', cursor: 'pointer' }} onClick={onClose}>
          <div style={{ width: '40px', height: '4px', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: '2px' }} />
        </div>

        {/* Drawer Header */}
        <div
          style={{
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GreatMindsRing size={26} animated glow />
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Nexa AI Smart Reply
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #00F2FE, #4FACFE)',
                    color: '#000',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Gemini
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>
                {roomName ? `Contextual assistant for ${roomName}` : 'AI response generator'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              color: '#A0A5B5',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Recent Context Preview */}
          {contextMessages.length > 0 && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '12.5px',
                color: 'rgba(255, 255, 255, 0.75)',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#00F2FE', textTransform: 'uppercase', marginBottom: '4px' }}>
                Replying To Context
              </div>
              <div style={{ fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                "{contextMessages[contextMessages.length - 1]?.sender}: {contextMessages[contextMessages.length - 1]?.text}"
              </div>
            </div>
          )}

          {/* Tone Selector */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
              SELECT RESPONSE TONE
            </div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {TONES.map((tone) => {
                const isSelected = selectedTone === tone.id;
                return (
                  <button
                    key={tone.id}
                    onClick={() => {
                      setSelectedTone(tone.id);
                      handleGenerate(tone.id, customInstruction);
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '20px',
                      border: isSelected ? '1px solid #00F2FE' : '1px solid rgba(255,255,255,0.12)',
                      background: isSelected ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255,255,255,0.05)',
                      color: isSelected ? '#00F2FE' : '#E0E0E0',
                      fontSize: '13px',
                      fontWeight: isSelected ? 600 : 400,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{tone.icon}</span>
                    <span>{tone.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Instruction Input */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>
              CUSTOM PROMPT / GUIDANCE (OPTIONAL)
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder='e.g. "Politely decline" or "Confirm for 3 PM"'
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerate(selectedTone, customInstruction);
                }}
                style={{
                  flex: 1,
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '13.5px',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => handleGenerate(selectedTone, customInstruction)}
                disabled={isLoading}
                style={{
                  background: 'linear-gradient(135deg, #00F2FE, #00C6FF)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0 16px',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                <Wand2 size={15} />
                Draft
              </button>
            </div>
          </div>

          {/* Quick Options Chips */}
          {quickOptions.length > 0 && !isLoading && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
                QUICK REPLIES
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {quickOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectReply(opt);
                      if (onToast) onToast('Inserted quick reply!');
                      onClose();
                    }}
                    style={{
                      background: 'rgba(69, 83, 255, 0.15)',
                      border: '1px solid rgba(69, 83, 255, 0.35)',
                      borderRadius: '16px',
                      padding: '8px 14px',
                      color: '#A2B1FF',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Zap size={13} color="#00F2FE" /> {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Draft Box or Loading */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>
              GENERATED DRAFT PREVIEW
            </div>
            {isLoading ? (
              <div
                style={{
                  padding: '28px',
                  borderRadius: '16px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px dashed rgba(0, 242, 254, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                }}
              >
                <GreatMindsRing size={36} animated glow />
                <div style={{ fontSize: '13.5px', color: '#00F2FE', fontWeight: 600 }}>
                  Gemini AI crafting smart reply...
                </div>
              </div>
            ) : (
              <textarea
                value={generatedDraft}
                onChange={(e) => setGeneratedDraft(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(0, 242, 254, 0.3)',
                  borderRadius: '16px',
                  padding: '12px 14px',
                  color: '#fff',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  outline: 'none',
                  resize: 'none',
                  boxSizing: 'border-box',
                }}
              />
            )}
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            gap: '10px',
          }}
        >
          <button
            onClick={() => handleGenerate(selectedTone, customInstruction)}
            disabled={isLoading}
            style={{
              padding: '12px 16px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RefreshCw size={15} /> Regenerate
          </button>

          <button
            onClick={() => {
              if (generatedDraft) {
                navigator.clipboard?.writeText(generatedDraft);
                if (onToast) onToast('Copied draft to clipboard!');
              }
            }}
            disabled={!generatedDraft}
            style={{
              padding: '12px 16px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Copy size={15} /> Copy
          </button>

          <button
            onClick={() => {
              if (generatedDraft) {
                onSelectReply(generatedDraft);
                if (onToast) onToast('Inserted draft into composer!');
                onClose();
              }
            }}
            disabled={!generatedDraft || isLoading}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: '14px',
              background: 'var(--accent-1, #00A884)',
              border: 'none',
              color: '#000',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(0, 168, 132, 0.3)',
            }}
          >
            <span>Insert into Composer</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
