'use client';
import StatusBadge from './StatusBadge';

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function RequestList({ requests, selectedId, onSelect }) {
  if (requests.length === 0) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 20px', textAlign: 'center', color: '#6b6b8a',
      }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
        <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px', color: '#e2e2ef' }}>
          Waiting for requests
        </div>
        <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
          Send a webhook to your inspector URL.<br />It will appear here instantly.
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {requests.map((req, i) => (
        <div
          key={req.id}
          onClick={() => onSelect(req)}
          style={{
            padding: '14px 16px', borderBottom: '1px solid #1e1e2e',
            cursor: 'pointer',
            background: selectedId === req.id ? '#1a1a2e' : 'transparent',
            borderLeft: selectedId === req.id ? '3px solid #6c63ff' : '3px solid transparent',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <StatusBadge method={req.method} />
            {i === 0 && (
              <span style={{
                fontSize: '10px', background: '#2a2750', color: '#6c63ff',
                padding: '1px 6px', borderRadius: '3px', fontWeight: '600',
              }}>NEW</span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: '#6b6b8a', display: 'flex', justifyContent: 'space-between' }}>
            <span>{timeAgo(req.received_at)}</span>
            <span>{formatBytes(req.body_size)}</span>
          </div>
          {req.content_type && (
            <div style={{ fontSize: '11px', color: '#4a4a6a', marginTop: '4px', fontFamily: 'monospace' }}>
              {req.content_type.split(';')[0]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}