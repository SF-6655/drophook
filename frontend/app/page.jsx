export default async function LandingPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  let session = null;
  try {
    const res = await fetch(`${BASE_URL}/api/sessions`, {
      method: 'POST',
      cache: 'no-store',
    });
    if (res.ok) session = await res.json();
  } catch {}

  return (
    <main style={{
      minHeight: '100vh', background: '#0a0a0f',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '40px 20px',
    }}>
      <div style={{ marginBottom: '48px', textAlign: 'center' }}>
        <div style={{
          fontSize: '42px', fontWeight: '800', letterSpacing: '-1px',
          background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '12px',
        }}>
          DropHook
        </div>
        <div style={{ fontSize: '18px', color: '#6b6b8a', maxWidth: '480px', lineHeight: '1.6' }}>
          Instantly inspect, debug and replay webhook requests.
          <br />No signup. No setup. Just a URL.
        </div>
      </div>

      {session ? (
        <div style={{
          background: '#13131a', border: '1px solid #1e1e2e',
          borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '600px',
          marginBottom: '40px',
        }}>
          <div style={{ fontSize: '13px', color: '#6b6b8a', marginBottom: '10px', fontWeight: '500' }}>
            YOUR INSPECTOR URL
          </div>
          <div style={{
            background: '#0a0a0f', border: '1px solid #2e2e4e',
            borderRadius: '8px', padding: '14px 16px',
            fontFamily: 'monospace', fontSize: '14px', color: '#a78bfa',
            wordBreak: 'break-all', marginBottom: '16px',
          }}>
            {session.url}
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a href={`/i/${session.id}`} style={{
              background: '#6c63ff', color: '#fff',
              padding: '10px 24px', borderRadius: '8px',
              textDecoration: 'none', fontWeight: '600', fontSize: '14px',
            }}>
              Open Inspector →
            </a>
            <div style={{
              background: '#1e1e2e', color: '#e2e2ef',
              border: '1px solid #2e2e4e', padding: '10px 20px',
              borderRadius: '8px', fontSize: '13px',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <span style={{ color: '#6b6b8a' }}>Expires in</span>
              <span style={{ color: '#f59e0b', fontWeight: '600' }}>24 hours</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          background: '#3a1a1a', border: '1px solid #7f1d1d',
          borderRadius: '12px', padding: '20px 24px', color: '#ef4444',
          marginBottom: '40px', fontSize: '14px',
        }}>
          Could not connect to backend. Make sure your server is running.
        </div>
      )}

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '16px', width: '100%', maxWidth: '600px', marginBottom: '48px',
      }}>
        {[
          { step: '1', title: 'Get a URL',      desc: 'Instantly generated above' },
          { step: '2', title: 'Send a webhook', desc: 'From Stripe, GitHub, anything' },
          { step: '3', title: 'Inspect live',   desc: 'See every request in real time' },
        ].map(({ step, title, desc }) => (
          <div key={step} style={{
            background: '#13131a', border: '1px solid #1e1e2e',
            borderRadius: '12px', padding: '20px',
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: '#2a2750', color: '#6c63ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: '700', marginBottom: '10px',
            }}>
              {step}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{title}</div>
            <div style={{ fontSize: '12px', color: '#6b6b8a' }}>{desc}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '12px', color: '#4a4a6a', textAlign: 'center' }}>
        Built by Saad Fayyaz · Open Source ·{' '}
        <a href="https://github.com/SF-6655/drophook" style={{ color: '#6c63ff', textDecoration: 'none' }}>
          GitHub
        </a>
      </div>
    </main>
  );
}