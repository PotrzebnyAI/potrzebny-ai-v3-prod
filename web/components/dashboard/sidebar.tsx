'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Brain,
  LayoutDashboard,
  BookOpen,
  Users,
  Heart,
  Stethoscope,
  Sparkles,
  Baby,
  Award,
  Settings,
  CreditCard,
  HelpCircle,
  LogOut,
  Shield,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

const menuItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/panels/educational', icon: BookOpen, label: 'Edukacja' },
  { href: '/panels/lecturer', icon: Users, label: 'Wykładowca' },
  { href: '/panels/patient', icon: Heart, label: 'Pacjent' },
  { href: '/panels/doctor', icon: Stethoscope, label: 'Lekarz' },
  { href: '/panels/super-mozg', icon: Sparkles, label: 'Super Mózg' },
  { href: '/panels/parent-premium', icon: Baby, label: 'Rodzic' },
  { href: '/panels/gamification', icon: Award, label: 'Gamifikacja' },
];

const adminItems = [
  { href: '/panels/platform-admin', icon: Shield, label: 'Admin' },
];

const bottomItems = [
  { href: '/settings', icon: Settings, label: 'Ustawienia' },
  { href: '/billing', icon: CreditCard, label: 'Płatności' },
  { href: '/help', icon: HelpCircle, label: 'Pomoc' },
];

export function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = user.role === 'admin';

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r bg-card lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Brain className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">Potrzebny.AI</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}

          {isAdmin && (
            <>
              <div className="my-4 border-t" />
              {adminItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    pathname === item.href || pathname.startsWith(item.href + '/')
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t p-4">
          <nav className="space-y-1">
            {bottomItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="h-5 w-5" />
              Wyloguj się
            </Button>
          </nav>
        </div>
      </div>
    </aside>
  );
}
