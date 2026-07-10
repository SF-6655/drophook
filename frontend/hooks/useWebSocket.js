'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

export function useWebSocket(sessionId, onNewRequest, onExpired) {
  const ws = useRef(null);
  const reconnectTimer = useRef(null);
  const [status, setStatus] = useState('connecting');

  const connect = useCallback(() => {
    if (!sessionId) return;
    try {
      ws.current = new WebSocket(WS_URL);
      ws.current.onopen = () => {
        setStatus('connected');
        ws.current.send(JSON.stringify({ type: 'subscribe', sessionId }));
      };
      ws.current.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'new_request' && onNewRequest) onNewRequest(msg.data);
          if (msg.type === 'session_expired' && onExpired) onExpired();
        } catch (e) { console.error('[WS] parse error', e); }
      };
      ws.current.onclose = () => {
        setStatus('disconnected');
        reconnectTimer.current = setTimeout(() => {
          setStatus('connecting');
          connect();
        }, 3000);
      };
      ws.current.onerror = () => ws.current?.close();
    } catch (e) {
      console.error('[WS] error', e);
      setStatus('disconnected');
    }
  }, [sessionId, onNewRequest, onExpired]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      ws.current?.close();
    };
  }, [connect]);

  return { status };
}