'use client';

const METHOD_COLORS = {
  GET:    { bg: '#1a3a2a', text: '#22c55e', border: '#166534' },
  POST:   { bg: '#1a2a4a', text: '#3b82f6', border: '#1e3a8a' },
  PUT:    { bg: '#2a2a1a', text: '#f59e0b', border: '#78350f' },
  PATCH:  { bg: '#2a1a3a', text: '#a855f7', border: '#581c87' },
  DELETE: { bg: '#3a1a1a', text: '#ef4444', border: '#7f1d1d' },
  HEAD:   { bg: '#1a2a2a', text: '#67e8f9', border: '#164e63' },
  OPTIONS:{ bg: '#2a2a2a', text: '#9ca3af', border: '#374151' },
};

export default function StatusBadge({ method }) {
  const colors = METHOD_COLORS[method?.toUpperCase()] || METHOD_COLORS.OPTIONS;
  return (
    <span style={{
      background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
      padding: '2px 8px', borderRadius: '4px', fontSize: '11px',
      fontWeight: '700', fontFamily: 'monospace', letterSpacing: '0.05em',
    }}>
      {method?.toUpperCase() || 'GET'}
    </span>
  );
}