'use client';
import { useState } from 'react';

export default function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button onClick={handleCopy} style={{
      background: copied ? '#166534' : '#1e1e2e',
      color: copied ? '#22c55e' : '#e2e2ef',
      border: `1px solid ${copied ? '#166534' : '#2e2e4e'}`,
      padding: '6px 14px', borderRadius: '6px', fontSize: '13px',
      cursor: 'pointer', transition: 'all 0.15s', fontWeight: '500',
    }}>
      {copied ? '✓ Copied!' : label}
    </button>
  );
}