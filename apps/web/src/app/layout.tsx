import './globals.css';
export const metadata = {
  title: 'Secure AI Control',
  description: 'Governance-first launches. Two-week proof, then scale.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}


