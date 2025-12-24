'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Award,
  Flame,
  Zap,
  Trophy,
  Star,
  Target,
  Medal,
  Crown,
  Gift,
  TrendingUp,
} from 'lucide-react';

interface GamificationData {
  totalXp: number;
  currentLevel: number;
  currentStreakDays: number;
  longestStreakDays: number;
  badges: Badge[];
  dailyGoalsCompleted: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  level: number;
  xp: number;
  isCurrentUser: boolean;
}

const LEVEL_THRESHOLDS = [0, 100, 400, 900, 1600, 2500, 3600, 4900, 6400, 8100, 10000];

const BADGES = [
  { id: 'first_login', name: 'Pierwszy krok', description: 'Pierwsze logowanie', icon: '🎯' },
  { id: 'week_streak', name: 'Tydzień aktywności', description: '7 dni z rzędu', icon: '🔥' },
  { id: 'month_streak', name: 'Miesiąc wytrwałości', description: '30 dni z rzędu', icon: '💪' },
  { id: 'first_course', name: 'Student', description: 'Ukończ pierwszy kurs', icon: '📚' },
  { id: 'quiz_master', name: 'Mistrz quizów', description: 'Zdaj 10 quizów na 100%', icon: '🏆' },
  { id: 'flashcard_pro', name: 'Fiszkomania', description: 'Przejrzyj 1000 fiszek', icon: '🧠' },
  { id: 'early_bird', name: 'Ranny ptaszek', description: 'Ucz się przed 6:00', icon: '🌅' },
  { id: 'night_owl', name: 'Nocny marek', description: 'Ucz się po 22:00', icon: '🦉' },
];

export default function GamificationPanelPage() {
  const [data, setData] = useState<GamificationData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [gamResponse, leaderboardResponse] = await Promise.all([
        fetch('/api/panel/gamification'),
        fetch('/api/panel/gamification/leaderboard'),
      ]);

      const gamData = await gamResponse.json();
      const leaderData = await leaderboardResponse.json();

      if (gamData.success) {
        setData(gamData.data);
      }
      if (leaderData.success) {
        setLeaderboard(leaderData.data);
      }
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getXpForNextLevel = (level: number) => {
    return LEVEL_THRESHOLDS[Math.min(level, LEVEL_THRESHOLDS.length - 1)] || 10000;
  };

  const getXpProgress = () => {
    if (!data) return 0;
    const currentLevelXp = LEVEL_THRESHOLDS[data.currentLevel - 1] || 0;
    const nextLevelXp = getXpForNextLevel(data.currentLevel);
    const progress = ((data.totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-muted rounded" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-muted rounded" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Gamifikacja
        </h1>
        <p className="text-muted-foreground">Zdobywaj XP, odznaki i rywalizuj z innymi</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Poziom</CardTitle>
            <Crown className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-600">{data?.currentLevel || 1}</div>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>{data?.totalXp || 0} XP</span>
                <span>{getXpForNextLevel(data?.currentLevel || 1)} XP</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 transition-all"
                  style={{ width: `${getXpProgress()}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Całkowite XP</CardTitle>
            <Zap className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">{data?.totalXp || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">punktów doświadczenia</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Seria dni</CardTitle>
            <Flame className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-orange-600">{data?.currentStreakDays || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              rekord: {data?.longestStreakDays || 0} dni
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cele dzienne</CardTitle>
            <Target className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">{data?.dailyGoalsCompleted || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">ukończonych celów</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="h-5 w-5" />
              Twoje odznaki
            </CardTitle>
            <CardDescription>Zdobyte osiągnięcia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {BADGES.map((badge) => {
                const earned = data?.badges?.some(b => b.id === badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                      earned
                        ? 'bg-primary/10 border border-primary/30'
                        : 'bg-muted/50 opacity-50'
                    }`}
                    title={badge.description}
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <span className="text-xs mt-1 text-center line-clamp-1">{badge.name}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ranking
            </CardTitle>
            <CardDescription>Top 10 użytkowników</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard.length > 0 ? leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    entry.isCurrentUser ? 'bg-primary/10 border border-primary/30' : ''
                  }`}
                >
                  <div className="w-8 text-center font-bold">
                    {entry.rank <= 3 ? (
                      <span className={`text-lg ${
                        entry.rank === 1 ? 'text-yellow-500' :
                        entry.rank === 2 ? 'text-gray-400' : 'text-orange-600'
                      }`}>
                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">{entry.rank}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{entry.displayName}</p>
                    <p className="text-xs text-muted-foreground">Poziom {entry.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{entry.xp}</p>
                    <p className="text-xs text-muted-foreground">XP</p>
                  </div>
                </div>
              )) : (
                <p className="text-center text-muted-foreground py-8">Brak danych rankingu</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Dzienne wyzwania
          </CardTitle>
          <CardDescription>Wykonaj zadania aby zdobyć bonus XP</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between">
                <span className="text-2xl">📚</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">+50 XP</span>
              </div>
              <h4 className="font-medium mt-2">30 minut nauki</h4>
              <p className="text-xs text-muted-foreground">Ucz się przez 30 minut</p>
              <div className="mt-3">
                <div className="h-2 bg-muted rounded-full">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '60%' }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">18/30 min</p>
              </div>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🧠</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">+30 XP</span>
              </div>
              <h4 className="font-medium mt-2">20 fiszek</h4>
              <p className="text-xs text-muted-foreground">Przejrzyj 20 fiszek</p>
              <div className="mt-3">
                <div className="h-2 bg-muted rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '0%' }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">0/20</p>
              </div>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between">
                <span className="text-2xl">✅</span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">+40 XP</span>
              </div>
              <h4 className="font-medium mt-2">Ukończ quiz</h4>
              <p className="text-xs text-muted-foreground">Zdaj quiz na min. 80%</p>
              <div className="mt-3">
                <div className="h-2 bg-muted rounded-full">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '0%' }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">0/1</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
