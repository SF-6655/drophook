const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = {
  async createSession() {
    const res = await fetch(`${BASE_URL}/api/sessions`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to create session');
    return res.json();
  },
  async getSession(id) {
    const res = await fetch(`${BASE_URL}/api/sessions/${id}`);
    if (!res.ok) throw new Error('Session not found');
    return res.json();
  },
  async getRequests(sessionId) {
    const res = await fetch(`${BASE_URL}/api/requests/${sessionId}`);
    if (!res.ok) throw new Error('Failed to fetch requests');
    return res.json();
  },
  async getRequest(sessionId, requestId) {
    const res = await fetch(`${BASE_URL}/api/requests/${sessionId}/${requestId}`);
    if (!res.ok) throw new Error('Failed to fetch request');
    return res.json();
  },
  async replayRequest(sessionId, requestId, targetUrl) {
    const res = await fetch(`${BASE_URL}/api/requests/${sessionId}/${requestId}/replay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl }),
    });
    if (!res.ok) throw new Error('Replay failed');
    return res.json();
  },
};

export default api;