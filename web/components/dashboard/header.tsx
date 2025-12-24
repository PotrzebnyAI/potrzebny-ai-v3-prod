'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Menu,
  Moon,
  Sun,
  User,
  Settings,
  LogOut,
  Search,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

interface HeaderProps {
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
}

export function DashboardHeader({ user }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-6">
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="lg:hidden">
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search */}
      <div className="hidden flex-1 md:block">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Szukaj..."
            className="h-10 w-full rounded-md border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Zmień motyw</span>
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
          </Button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-card shadow-lg">
              <div className="border-b p-4">
                <h3 className="font-semibold">Powiadomienia</h3>
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                <p className="p-4 text-center text-sm text-muted-foreground">
                  Brak nowych powiadomień
                </p>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden text-sm md:inline-block">
              {user.name || user.email.split('@')[0]}
            </span>
          </Button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border bg-card shadow-lg">
              <div className="border-b p-3">
                <p className="text-sm font-medium">{user.name || 'Użytkownik'}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="p-1">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User className="h-4 w-4" />
                  Profil
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings className="h-4 w-4" />
                  Ustawienia
                </Link>
                <button
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-muted"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="h-4 w-4" />
                  Wyloguj się
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
