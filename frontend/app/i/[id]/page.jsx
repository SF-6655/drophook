'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RequestList from '../../../components/RequestList';
import RequestDetail from '../../../components/RequestDetail';
import WSStatus from '../../../components/WSStatus';
import CopyButton from '../../../components/CopyButton';
import { useWebSocket } from '../../../hooks/useWebSocket';
import api from '../../../lib/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function InspectorPage() {
  const { id } = useParams();
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([api.getSession(id), api.getRequests(id)])
      .then(([sess, reqs]) => setRequests(reqs.requests || []))
      .catch(() => router.push('/expired'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleNewRequest = useCallback((data) => {
    setRequests(prev => [data, ...prev]);
  }, []);

  const handleExpired = useCallback(() => {
    router.push('/expired');
  }, [router]);

  const { status } = useWebSocket(id, handleNewRequest, handleExpired);

  const inspectorUrl = `${BASE_URL}/i/${id}`;

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b6b8a' }}>
      Loading inspector…
    </div>
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0f' }}>
      <div style={{
        height: '56px', background: '#13131a', borderBottom: '1px solid #1e1e2e',
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: '16px', flexShrink: 0,
      }}>
        <a href="/" style={{
          fontSize: '18px', fontWeight: '800',
          background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          textDecoration: 'none',
        }}>DropHook</a>
        <div style={{ width: '1px', height: '20px', background: '#1e1e2e' }} />
        <div style={{
          flex: 1, background: '#0a0a0f', border: '1px solid #1e1e2e',
          borderRadius: '6px', padding: '6px 12px',
          fontFamily: 'monospace', fontSize: '12px', color: '#a78bfa',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {inspectorUrl}
        </div>
        <CopyButton text={inspectorUrl} label="Copy URL" />
        <WSStatus status={status} />
        <div style={{
          fontSize: '12px', color: '#6b6b8a', background: '#1e1e2e',
          padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap',
        }}>
          {requests.length} request{requests.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{
          width: '280px', flexShrink: 0, borderRight: '1px solid #1e1e2e',
          display: 'flex', flexDirection: 'column', background: '#0d0d18',
        }}>
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid #1e1e2e',
            fontSize: '11px', fontWeight: '700', color: '#6b6b8a',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            Requests
          </div>
          <RequestList requests={requests} selectedId={selected?.id} onSelect={setSelected} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <RequestDetail request={selected} sessionId={id} />
        </div>
      </div>
    </div>
  );
}