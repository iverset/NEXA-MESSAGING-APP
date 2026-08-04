import React, { useState, useEffect, useRef } from 'react';
import { GreatMindsRing } from './GreatMindsRing';
import { Mic, MicOff, Volume2, X, Camera, Sparkles, PhoneOff } from 'lucide-react';
import { askGreatMindsAI } from '../services/GreatMindsAIService';

interface GreatMindsVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage?: (text: string) => void;
  onToast?: (msg: string) => void;
}

export const GreatMindsVoiceModal: React.FC<GreatMindsVoiceModalProps> = ({
  isOpen,
  onClose,
  onSendMessage,
  onToast,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<'listening' | 'thinking' | 'speaking'>('listening');
  const [userSpeech, setUserSpeech] = useState<string>('');
  const [aiSpeech, setAiSpeech] = useState<string>('Hello! I am Great Minds AI Voice Assistant. Speak now, I am listening!');
  const [waveHeights, setWaveHeights] = useState<number[]>([15, 30, 45, 60, 40, 25, 55, 35, 20]);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    // Speak initial greeting
    speakText('Hello! I am Great Minds AI. Ask me anything by speaking.');

    // Equalizer animation interval
    const interval = setInterval(() => {
      setWaveHeights(Array.from({ length: 12 }, () => Math.floor(Math.random() * 60) + 12));
    }, 120);

    // Try setting up Web Speech API if supported
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setUserSpeech(transcript);
            if (event.results[event.results.length - 1].isFinal) {
              handleProcessSpeech(transcript);
            }
          }
        };

        rec.onerror = (e: any) => {
          console.warn('Speech recognition notice:', e);
        };

        rec.start();
        recognitionRef.current = rec;
      } catch (e) {
        console.warn('Speech recognition init warning:', e);
      }
    }

    return () => {
      clearInterval(interval);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [isOpen]);

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.onstart = () => setStatus('speaking');
      utterance.onend = () => setStatus('listening');
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleProcessSpeech = async (query: string) => {
    if (!query.trim()) return;
    setStatus('thinking');
    setUserSpeech(query);

    const res = await askGreatMindsAI(query);
    setAiSpeech(res.text);
    setStatus('speaking');
    speakText(res.text);

    if (onSendMessage) {
      onSendMessage(`🎤 [Voice Mode Query]: ${query}`);
    }
  };

  const handleSimulatedSpeech = (presetQuery: string) => {
    handleProcessSpeech(presetQuery);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'radial-gradient(circle at center, #131c2c 0%, #080c14 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 20px',
        color: '#ffffff',
        animation: 'fadeIn 0.25s ease-out',
      }}
      role="dialog"
      aria-label="Great Minds AI Voice Mode"
    >
      {/* Top Header */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <GreatMindsRing size={32} animated glow />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', letterSpacing: '0.2px' }}>
              Great Minds AI Voice Mode
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: status === 'listening' ? '#00e676' : status === 'thinking' ? '#ffab00' : '#00b0ff',
                  boxShadow: `0 0 10px ${status === 'listening' ? '#00e676' : status === 'thinking' ? '#ffab00' : '#00b0ff'}`,
                }}
              />
              {status === 'listening' ? 'Listening...' : status === 'thinking' ? 'Great Minds AI is formulating...' : 'Great Minds AI is speaking'}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#fff',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Close Voice Mode"
        >
          <X size={20} />
        </button>
      </div>

      {/* Center Interactive Ring & Equalizer */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '32px',
          margin: 'auto 0',
          textAlign: 'center',
          width: '100%',
          maxWidth: '480px',
        }}
      >
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Animated Glow Rings Background */}
          <div
            style={{
              position: 'absolute',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.25), rgba(225, 0, 255, 0.25))',
              filter: 'blur(30px)',
              animation: 'pulseGlow 2s infinite ease-in-out',
            }}
          />

          <GreatMindsRing size={120} animated glow />
        </div>

        {/* Dynamic Waveform Visualizer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '64px', padding: '0 16px' }}>
          {waveHeights.map((h, i) => (
            <div
              key={i}
              style={{
                width: '6px',
                height: `${isMuted ? 6 : h}px`,
                background: 'linear-gradient(to top, #00c6ff, #e100ff)',
                borderRadius: '6px',
                transition: 'height 0.12s ease-in-out',
              }}
            />
          ))}
        </div>

        {/* Live Captions Box for Accessibility */}
        <div
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '16px',
            padding: '16px 20px',
            width: '100%',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '6px' }}>
            {userSpeech ? 'You Said:' : 'Great Minds AI Voice:'}
          </div>
          <div style={{ fontSize: '15px', color: '#fff', lineHeight: 1.5, maxHeight: '90px', overflowY: 'auto' }}>
            {userSpeech || aiSpeech}
          </div>
        </div>

        {/* Quick Voice Prompt Shortcuts */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {[
            'Summarize today\'s messages',
            'What is the weather in Kampala?',
            'Tell me a creative story',
          ].map((preset) => (
            <button
              key={preset}
              onClick={() => handleSimulatedSpeech(preset)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.9)',
                padding: '8px 14px',
                borderRadius: '20px',
                fontSize: '12.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={13} style={{ color: '#00F2FE' }} />
              <span>{preset}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
        <button
          onClick={() => {
            setIsMuted(!isMuted);
            if (onToast) onToast(isMuted ? 'Microphone unmuted' : 'Microphone muted');
          }}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: isMuted ? '#ff5252' : 'rgba(255,255,255,0.15)',
            border: 'none',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.15s',
          }}
          title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        <button
          onClick={onClose}
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: '#ff3b30',
            border: 'none',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(255, 59, 48, 0.4)',
          }}
          title="End Voice Call"
        >
          <PhoneOff size={28} />
        </button>

        <button
          onClick={() => {
            if (onToast) onToast('Visual Camera AI activated. Point camera at object to analyze!');
          }}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title="Camera Visual AI"
        >
          <Camera size={24} />
        </button>
      </div>
    </div>
  );
};
