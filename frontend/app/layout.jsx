import './globals.css';

export const metadata = {
  title: 'DropHook — Webhook Inspector & Debugger',
  description: 'Instantly inspect, debug and replay webhook requests. Get a live URL in seconds — no signup needed.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}