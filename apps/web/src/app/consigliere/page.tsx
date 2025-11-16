import Consigliere from '@/app/components/Consigliere';

export const metadata = {
  title: 'The Consigliere - Strategic Advisor',
  description: 'Your right hand. Strategic advice. Direct reports.',
};

export default function ConsiglierePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Consigliere />
    </div>
  );
}
