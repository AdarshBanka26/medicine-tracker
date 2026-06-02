'use client';
import { useState, useRef, useEffect } from 'react';

const SUGGESTED = [
  'Analyze the high-risk omens for the upcoming week.',
  'Which elixir am I most likely to forget?',
  'Give me a forecast for my adherence this month.',
  'What patterns do you see in my missed doses?',
];

function Bubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
      {!isUser && (
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%', background: 'var(--blue)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          fontSize: '12px', fontWeight: '700', flexShrink: 0, marginRight: '8px', alignSelf: 'flex-end',
        }}>✦</div>
      )}
      <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'} style={{ whiteSpace: 'pre-wrap' }}>
        {msg.text}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 0' }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%', background: 'var(--blue)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: '700',
      }}>✦</div>
      <div className="chat-bubble-ai" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: '6px', height: '6px', borderRadius: '50%', background: '#9CA3AF',
            display: 'inline-block',
            animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

// Mini calendar widget
function MiniCalendar() {
  const now = new Date();
  const month = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const today = now.getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '13px', fontWeight: '600' }}>SKY CALENDAR</span>
        <a href="/calendar" style={{ fontSize: '11px', color: 'var(--blue)', textDecoration: 'none' }}>View All</a>
      </div>
      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', textAlign: 'center' }}>{month}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px', textAlign: 'center' }}>
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} style={{ fontSize: '10px', color: 'var(--text-muted)', padding: '2px', fontWeight: '600' }}>{d}</div>
        ))}
        {blanks.map(i => <div key={`b${i}`} />)}
        {days.map(d => (
          <div key={d} style={{
            fontSize: '11px',
            padding: '3px',
            borderRadius: '50%',
            background: d === today ? 'var(--blue)' : 'transparent',
            color: d === today ? '#fff' : 'var(--text-primary)',
            fontWeight: d === today ? '700' : '400',
            cursor: 'pointer',
            textAlign: 'center',
          }}>{d}</div>
        ))}
      </div>
    </div>
  );
}

export default function FortuneTellerPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  async function sendMessage(text) {
    const userMsg = { role: 'user', text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: messages, message: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages([...next, { role: 'model', text: data.text }]);
    } catch (err) {
      setError(err.message || 'The oracle is unavailable. Check your Gemini API key.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%,80%,100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
        }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700' }}>The Mystic's Sanctum</h1>
          <span className="badge badge-green" style={{ fontSize: '11px' }}>● Oracle Online</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Query the AI Oracle for institutional risk patterns and resource forecasting.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', alignItems: 'start' }}>
        {/* Chat panel */}
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '600px' }}>
          {/* Chat header */}
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#2563EB,#7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px',
            }}>✦</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>The Mystic's Sanctum</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Powered by Gemini AI</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            {messages.length === 0 && (
              <div>
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px', padding: '20px 0' }}>
                  Greetings, Chief Alchemist. I have analyzed the current celestial alignment and resource volatility. How may I assist your forecasting today?
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {SUGGESTED.map(q => (
                    <button key={q} onClick={() => sendMessage(q)} style={{
                      background: '#F8FAFF', border: '1px solid #DBEAFE',
                      borderRadius: '8px', padding: '10px 14px',
                      fontSize: '12px', color: 'var(--text-primary)',
                      textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.borderColor = 'var(--blue)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFF'; e.currentTarget.style.borderColor = '#DBEAFE'; }}
                    >{q}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => <Bubble key={i} msg={m} />)}
            {loading && <TypingDots />}
            {error && (
              <div style={{
                background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px',
                padding: '10px 14px', fontSize: '12px', color: '#991B1B', marginTop: '8px',
              }}>
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border)',
            display: 'flex', gap: '8px',
          }}>
            <input
              ref={inputRef}
              className="field-input"
              placeholder="Type your query to the Oracle..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && input.trim() && !loading) { e.preventDefault(); sendMessage(input.trim()); } }}
              style={{ flex: 1 }}
            />
            <button
              className="btn-primary"
              style={{ padding: '9px 14px', flexShrink: 0 }}
              onClick={() => input.trim() && !loading && sendMessage(input.trim())}
              disabled={!input.trim() || loading}
            >▶</button>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <MiniCalendar />

          {/* Celestial Predictions placeholder */}
          <div className="card">
            <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>CELESTIAL PREDICTIONS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Elixir Stability', val: '+2.4%', color: '#10B981', desc: 'Trailing 7-Cycle Variance' },
                { label: 'Retention Velocity', val: '-0.8%', color: '#EF4444', desc: 'Predicted Volatility Index' },
              ].map(p => (
                <div key={p.label} style={{ padding: '10px 12px', background: '#F9FAFB', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>{p.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: p.color }}>{p.val}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{p.desc}</div>
                  {/* Mini bar chart placeholder */}
                  <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', marginTop: '8px', height: '28px' }}>
                    {[60, 75, 55, 80, 65, 90, 70].map((h, i) => (
                      <div key={i} style={{
                        flex: 1, height: `${h}%`, borderRadius: '2px',
                        background: i === 6 ? p.color : '#E5E7EB',
                      }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
