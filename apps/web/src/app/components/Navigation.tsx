'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon?: string;
  highlight?: boolean;
}

export default function Navigation() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠', highlight: true },
    { href: '/health-check', label: 'Health Check', icon: '🏥' },
    { href: '/code-editor', label: 'Code Editor', icon: '💻' },
    { href: '/value-optimization', label: 'Value Optimization', icon: '💎' },
    { href: '/trend-intelligence', label: 'Trend Intelligence', icon: '📈' },
    { href: '/podcast-intelligence', label: 'Podcast Intelligence', icon: '🎙️' },
    { href: '/seo-department', label: 'SEO Department', icon: '🔍' },
    { href: '/accounts-department', label: 'Accounts', icon: '💰' },
    { href: '/senior-dev', label: 'Senior Dev', icon: '👨‍💻' },
    { href: '/security-advisory', label: 'Security', icon: '🔒' },
    { href: '/hr-department', label: 'HR', icon: '👥' },
    { href: '/legal-department', label: 'Legal', icon: '⚖️' },
    { href: '/recruitment-consultant', label: 'Recruitment', icon: '🎯' },
    { href: '/ceo-bot', label: 'CEO Bot', icon: '👔' },
    { href: '/well-being-team', label: 'Well Being', icon: '🌟' },
    { href: '/crypto-trading', label: 'Crypto Trading', icon: '💰' },
  ];

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full border px-3 py-2 text-center text-xs transition sm:px-4 sm:text-sm ${
              isActive
                ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-200'
                : item.highlight
                ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200 hover:border-emerald-300/60 hover:text-emerald-100'
                : 'border-white/20 text-white hover:border-emerald-300/60 hover:text-emerald-200'
            }`}
          >
            {item.icon && <span className="mr-1">{item.icon}</span>}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

