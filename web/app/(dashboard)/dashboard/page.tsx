import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  ArrowRight,
  Flame,
  Target,
  Zap,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const supabase = createServerSupabaseClient();

  // Get user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, display_name')
    .eq('user_id', session?.user?.id)
    .single();

  // Get gamification data
  const { data: gamification } = await supabase
    .from('gamification_data')
    .select('*')
    .eq('user_id', session?.user?.id)
    .single();

  // Get active subscriptions
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('panel_type, status, plan_id')
    .eq('user_id', session?.user?.id)
    .in('status', ['active', 'trialing']);

  // Get recent content progress
  const { data: recentProgress } = await supabase
    .from('user_content_progress')
    .select(`
      *,
      educational_content(title, content_type, estimated_duration_minutes)
    `)
    .eq('user_id', session?.user?.id)
    .order('last_accessed_at', { ascending: false })
    .limit(5);

  const displayName = profile?.display_name || profile?.first_name || 'Użytkownik';

  const stats = [
    {
      label: 'Poziom',
      value: gamification?.current_level || 1,
      icon: Award,
      color: 'text-yellow-500',
    },
    {
      label: 'XP',
      value: gamification?.total_xp || 0,
      icon: Zap,
      color: 'text-blue-500',
    },
    {
      label: 'Seria dni',
      value: gamification?.current_streak_days || 0,
      icon: Flame,
      color: 'text-orange-500',
    },
    {
      label: 'Cele dzienne',
      value: `${gamification?.daily_goals_completed || 0}`,
      icon: Target,
      color: 'text-green-500',
    },
  ];

  const panels = [
    { id: 'educational', name: 'Panel Edukacyjny', href: '/panels/educational', icon: BookOpen },
    { id: 'patient', name: 'Panel Pacjenta', href: '/panels/patient', icon: TrendingUp },
    { id: 'gamification', name: 'Gamifikacja', href: '/panels/gamification', icon: Award },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Witaj, {displayName}!</h1>
        <p className="mt-2 text-muted-foreground">
          Oto przegląd Twoich postępów i aktywności
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {panels.map((panel) => {
          const isActive = subscriptions?.some(
            (sub) => sub.panel_type === panel.id
          );

          return (
            <Card key={panel.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <panel.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{panel.name}</CardTitle>
                    <CardDescription>
                      {isActive ? 'Aktywny' : 'Nieaktywny'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href={panel.href}>
                  <Button className="w-full" variant={isActive ? 'default' : 'outline'}>
                    {isActive ? 'Przejdź' : 'Aktywuj'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Ostatnia aktywność</CardTitle>
          <CardDescription>Twoje ostatnio przeglądane materiały</CardDescription>
        </CardHeader>
        <CardContent>
          {recentProgress && recentProgress.length > 0 ? (
            <div className="space-y-4">
              {recentProgress.map((progress) => (
                <div
                  key={progress.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {progress.educational_content?.title || 'Materiał'}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {progress.educational_content?.estimated_duration_minutes || 0} min
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {progress.progress_percentage}%
                    </div>
                    <div className="h-2 w-24 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${progress.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Brak aktywności</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Zacznij naukę aby zobaczyć swoje postępy
              </p>
              <Link href="/panels/educational">
                <Button className="mt-4">
                  Rozpocznij naukę
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
