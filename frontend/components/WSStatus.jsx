'use client';

const STATUS_CONFIG = {
  connected:    { color: '#22c55e', label: 'Live'         },
  connecting:   { color: '#f59e0b', label: 'Connecting…'  },
  disconnected: { color: '#ef4444', label: 'Disconnected' },
};

export default function WSStatus({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.disconnected;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{
        width: '8px', height: '8px', borderRadius: '50%',
        background: config.color, boxShadow: `0 0 6px ${config.color}`,
      }} />
      <span style={{ fontSize: '12px', color: config.color, fontWeight: '500' }}>
        {config.label}
      </span>
    </div>
  );
}