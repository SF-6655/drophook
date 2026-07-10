'use client';
import { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';
import CopyButton from './CopyButton';
import api from '../lib/api';

function JsonViewer({ data }) {
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    const formatted = JSON.stringify(parsed, null, 2)
      .replace(/(".*?")\s*:/g, '<span class="json-key">$1</span>:')
      .replace(/:\s*(".*?")/g, ': <span class="json-string">$1</span>')
      .replace(/:\s*(\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
      .replace(/:\s*(true|false)/g, ': <span class="json-boolean">$1</span>')
      .replace(/:\s*(null)/g, ': <span class="json-null">$1</span>');
    return (
      <pre dangerouslySetInnerHTML={{ __html: formatted }} style={{
        margin: 0, padding: '16px', fontSize: '12px',
        fontFamily: 'monospace', lineHeight: '1.6', overflowX: 'auto', color: '#e2e2ef',
      }} />
    );
  } catch {
    return (
      <pre style={{
        margin: 0, padding: '16px', fontSize: '12px',
        fontFamily: 'monospace', lineHeight: '1.6', color: '#e2e2ef', overflowX: 'auto',
      }}>{data}</pre>
    );
  }
}

const TAB_STYLE = (active) => ({
  padding: '8px 16px', fontSize: '13px', fontWeight: '500',
  cursor: 'pointer', border: 'none', background: 'transparent',
  color: active ? '#6c63ff' : '#6b6b8a',
  borderBottom: active ? '2px solid #6c63ff' : '2px solid transparent',
});

export default function RequestDetail({ request, sessionId }) {
  const [tab, setTab] = useState('body');
  const [fullReq, setFullReq] = useState(null);
  const [replayUrl, setReplayUrl] = useState('');
  const [replayResult, setReplayResult] = useState(null);
  const [replaying, setReplaying] = useState(false);
  const [showReplay, setShowReplay] = useState(false);

  useEffect(() => {
    if (!request) return;
    setFullReq(null);
    setReplayResult(null);
    setTab('body');
    api.getRequest(sessionId, request.id)
      .then(data => setFullReq(data.request))
      .catch(console.error);
  }, [request?.id, sessionId]);

  const handleReplay = async () => {
    if (!replayUrl) return;
    setReplaying(true);
    setReplayResult(null);
    try {
      const result = await api.replayRequest(sessionId, request.id, replayUrl);
      setReplayResult(result);
    } catch (e) {
      setReplayResult({ error: e.message });
    } finally {
      setReplaying(false);
    }
  };

  if (!request) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: '#6b6b8a', flexDirection: 'column', gap: '12px',
      }}>
        <div style={{ fontSize: '32px' }}>👈</div>
        <div style={{ fontSize: '14px' }}>Select a request to inspect it</div>
      </div>
    );
  }

  const headers = fullReq?.headers || {};
  const body = fullReq?.body || '';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid #1e1e2e',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <StatusBadge method={request.method} />
          <span style={{ fontSize: '12px', color: '#6b6b8a' }}>
            {new Date(request.received_at).toLocaleTimeString()}
          </span>
          {request.source_ip && (
            <span style={{ fontSize: '11px', color: '#4a4a6a', fontFamily: 'monospace' }}>
              {request.source_ip}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <CopyButton text={body} label="Copy Body" />
          <button onClick={() => setShowReplay(!showReplay)} style={{
            background: '#2a2750', color: '#6c63ff', border: '1px solid #3d3880',
            padding: '6px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '500',
          }}>↺ Replay</button>
        </div>
      </div>

      {showReplay && (
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #1e1e2e', background: '#0d0d18' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              placeholder="https://your-server.com/webhook"
              value={replayUrl}
              onChange={e => setReplayUrl(e.target.value)}
              style={{
                flex: 1, background: '#13131a', border: '1px solid #2e2e4e',
                color: '#e2e2ef', padding: '8px 12px', borderRadius: '6px',
                fontSize: '13px', fontFamily: 'monospace', outline: 'none',
              }}
            />
            <button onClick={handleReplay} disabled={replaying || !replayUrl} style={{
              background: replaying ? '#1e1e2e' : '#6c63ff', color: '#fff',
              border: 'none', padding: '8px 16px', borderRadius: '6px',
              fontSize: '13px', cursor: replaying ? 'wait' : 'pointer', fontWeight: '600',
            }}>
              {replaying ? 'Sending…' : 'Send'}
            </button>
          </div>
          {replayResult && (
            <div style={{
              fontSize: '12px', fontFamily: 'monospace', padding: '8px 12px',
              background: replayResult.ok ? '#1a3a2a' : '#3a1a1a',
              borderRadius: '6px', color: replayResult.ok ? '#22c55e' : '#ef4444',
            }}>
              {replayResult.error ? `Error: ${replayResult.error}` : `${replayResult.status} · ${replayResult.response_time}ms`}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', borderBottom: '1px solid #1e1e2e' }}>
        {['body', 'headers', 'raw'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={TAB_STYLE(tab === t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'headers' && fullReq && (
              <span style={{
                marginLeft: '6px', fontSize: '10px', background: '#1e1e2e',
                padding: '1px 5px', borderRadius: '3px', color: '#6b6b8a',
              }}>{Object.keys(headers).length}</span>
            )}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', background: '#0d0d18' }}>
        {!fullReq ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b6b8a' }}>Loading…</div>
        ) : tab === 'body' ? (
          body ? <JsonViewer data={body} /> : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b6b8a', fontSize: '13px' }}>
              No body content
            </div>
          )
        ) : tab === 'headers' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <tbody>
              {Object.entries(headers).map(([key, val]) => (
                <tr key={key} style={{ borderBottom: '1px solid #1e1e2e' }}>
                  <td style={{ padding: '10px 16px', fontFamily: 'monospace', color: '#67e8f9', width: '35%', verticalAlign: 'top' }}>{key}</td>
                  <td style={{ padding: '10px 16px', fontFamily: 'monospace', color: '#e2e2ef', wordBreak: 'break-all' }}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <pre style={{
            margin: 0, padding: '16px', fontSize: '11px',
            fontFamily: 'monospace', color: '#6b6b8a', lineHeight: '1.6',
            overflowX: 'auto', whiteSpace: 'pre-wrap',
          }}>
            {`${request.method} /i/${sessionId}\n\n`}
            {Object.entries(headers).map(([k, v]) => `${k}: ${v}`).join('\n')}
            {body ? `\n\n${body}` : ''}
          </pre>
        )}
      </div>
    </div>
  );
}