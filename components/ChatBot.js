'use client';
import { useState, useRef, useEffect } from 'react';

const SUGGESTED = [
  'What pills do I need to take today?',
  'Did I miss any doses yesterday?',
  'Which elixir do I miss most often?',
  'What is my wellness rate this week?',
];

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: '4px', padding: '4px 0', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: 'var(--text-muted)', display: 'inline-block',
          animation: `chatBounce 1.2s ${i * 0.2}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

function Bubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
      {!isUser && (
        <div style={{
          width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
          background: 'var(--blue)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: '700',
          marginRight: '6px', alignSelf: 'flex-end',
        }}>✦</div>
      )}
      <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'} style={{ whiteSpace: 'pre-wrap', maxWidth: '80%' }}>
        {msg.text}
      </div>
    </div>
  );
}

export default function ChatBot() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  if (!mounted) return null;

  async function sendMessage(text) {
    const userMsg = { role: 'user', text };
    const next    = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: messages, message: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages([...next, { role: 'model', text: data.text }]);
    } catch (err) {
      setError(err.message || 'Oracle unavailable. Check your GEMINI_API_KEY.');
    } finally { setLoading(false); }
  }

  return (
    <>
      <style>{`
        @keyframes chatBounce {
          0%,80%,100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Floating button */}
      <button
        aria-label="Open AI assistant"
        onClick={() => setOpen(v => !v)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px',
          width: '52px', height: '52px', borderRadius: '50%',
          background: open ? 'var(--blue-navy)' : 'var(--blue)',
          border: '2px solid #fff',
          boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
          cursor: 'pointer', fontSize: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, transition: 'all 0.2s', color: '#fff',
        }}
      >
        {open ? '✕' : '✦'}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '88px', right: '24px',
          width: '360px', maxWidth: 'calc(100vw - 32px)',
          height: '500px', maxHeight: 'calc(100vh - 120px)',
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column',
          zIndex: 999, overflow: 'hidden',
          animation: 'chatSlideUp 0.2s ease-out',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            background: 'var(--blue)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '14px', fontWeight: '700',
            }}>✦</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>Fortune Teller</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>Powered by Gemini AI</div>
            </div>
            <div style={{
              marginLeft: 'auto', fontSize: '11px', fontWeight: '600',
              background: 'rgba(255,255,255,0.2)', borderRadius: '20px',
              padding: '2px 8px', color: '#fff',
            }}>● Online</div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px' }}>
            {messages.length === 0 && (
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '12px', lineHeight: 1.5 }}>
                  Ask me anything about your elixir schedule or adherence history.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {SUGGESTED.map(q => (
                    <button key={q} onClick={() => sendMessage(q)} style={{
                      background: 'var(--bg-table-head)', border: '1px solid var(--border)',
                      borderRadius: '8px', padding: '8px 12px', fontSize: '12px',
                      color: 'var(--text-primary)', textAlign: 'left', cursor: 'pointer',
                      transition: 'border-color 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--blue)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >{q}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => <Bubble key={i} msg={m} />)}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', flexShrink: 0 }}>✦</div>
                <div className="chat-bubble-ai"><TypingDots /></div>
              </div>
            )}
            {error && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#991B1B', marginTop: '8px' }}>
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
            <input
              ref={inputRef}
              className="field-input"
              placeholder="Ask the Fortune Teller…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && input.trim() && !loading) { e.preventDefault(); sendMessage(input.trim()); } }}
              style={{ flex: 1, fontSize: '13px' }}
            />
            <button
              className="btn-primary"
              style={{ padding: '9px 14px', flexShrink: 0 }}
              onClick={() => input.trim() && !loading && sendMessage(input.trim())}
              disabled={!input.trim() || loading}
            >▶</button>
          </div>
        </div>
      )}
    </>
  );
}
