export default function ExpiredPage() {
  return (
    <main style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0a0a0f', padding: '40px 20px', textAlign: 'center',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏰</div>
      <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#e2e2ef', marginBottom: '12px' }}>
        Session Expired
      </h1>
      <p style={{ fontSize: '15px', color: '#6b6b8a', marginBottom: '32px', maxWidth: '360px', lineHeight: '1.6' }}>
        This inspector URL has expired after 24 hours. Create a new one to keep inspecting webhooks.
      </p>
      <a href="/" style={{
        background: '#6c63ff', color: '#fff',
        padding: '12px 28px', borderRadius: '8px',
        textDecoration: 'none', fontWeight: '600', fontSize: '15px',
      }}>
        Create New Inspector
      </a>
    </main>
  );
}