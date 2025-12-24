'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toaster';
import {
  Brain,
  Sparkles,
  Target,
  Zap,
  Trophy,
  Clock,
  BookOpen,
  Lightbulb,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Settings,
} from 'lucide-react';

interface MemorySession {
  id: string;
  type: 'flashcard' | 'spaced_repetition' | 'memory_palace' | 'speed_reading';
  title: string;
  cardsTotal: number;
  cardsReviewed: number;
  accuracy: number;
  lastSession: string;
  nextReview: string;
  streakDays: number;
}

interface BrainStats {
  totalSessions: number;
  totalCardsLearned: number;
  averageAccuracy: number;
  streakDays: number;
  xpEarned: number;
  level: number;
  nextLevelXp: number;
  currentXp: number;
  brainScore: number;
}

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: string;
  xpReward: number;
  timeLimit: number;
  isCompleted: boolean;
}

export default function SuperMozgPanel() {
  const [sessions, setSessions] = useState<MemorySession[]>([]);
  const [stats, setStats] = useState<BrainStats | null>(null);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'learn' | 'practice' | 'stats'>('learn');

  // Pomodoro Timer
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);
  const [pomodoroType, setPomodoroType] = useState<'work' | 'break'>('work');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPomodoroRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(t => t - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      handlePomodoroComplete();
    }
    return () => clearInterval(interval);
  }, [isPomodoroRunning, pomodoroTime]);

  const fetchData = async () => {
    try {
      const [sessionsRes, statsRes, challengesRes] = await Promise.all([
        fetch('/api/panel/super-mozg/sessions'),
        fetch('/api/panel/super-mozg/stats'),
        fetch('/api/panel/super-mozg/challenges'),
      ]);

      const sessionsData = await sessionsRes.json();
      const statsData = await statsRes.json();
      const challengesData = await challengesRes.json();

      if (sessionsData.success) setSessions(sessionsData.data || []);
      if (statsData.success) setStats(statsData.data);
      if (challengesData.success) setDailyChallenges(challengesData.data || []);
    } catch (error) {
      console.error('Error fetching Super Mózg data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePomodoroComplete = () => {
    setIsPomodoroRunning(false);
    if (pomodoroType === 'work') {
      toast.success('Sesja zakończona! Czas na przerwę.');
      setPomodoroType('break');
      setPomodoroTime(5 * 60);
    } else {
      toast.success('Przerwa zakończona! Gotowy na kolejną sesję?');
      setPomodoroType('work');
      setPomodoroTime(25 * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetPomodoro = () => {
    setIsPomodoroRunning(false);
    setPomodoroType('work');
    setPomodoroTime(25 * 60);
  };

  const startSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/panel/super-mozg/sessions/${sessionId}/start`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        window.location.href = `/super-mozg/session/${sessionId}`;
      }
    } catch (error) {
      toast.error('Błąd rozpoczynania sesji');
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'flashcard':
        return <BookOpen className="h-5 w-5" />;
      case 'spaced_repetition':
        return <RotateCcw className="h-5 w-5" />;
      case 'memory_palace':
        return <Brain className="h-5 w-5" />;
      case 'speed_reading':
        return <Zap className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-500" />
            Super Mózg
          </h1>
          <p className="text-muted-foreground">Trenuj pamięć i zwiększ swoje możliwości kognitywne</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
          <Sparkles className="mr-2 h-4 w-4" />
          Rozpocznij trening
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader className="pb-2">
              <CardDescription>Brain Score</CardDescription>
              <CardTitle className="text-3xl text-purple-700">{stats.brainScore}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-sm text-purple-600">
                <TrendingUp className="h-4 w-4" />
                <span>+12 od zeszłego tygodnia</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Poziom</CardDescription>
              <CardTitle className="text-2xl">{stats.level}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${(stats.currentXp / stats.nextLevelXp) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{stats.currentXp}/{stats.nextLevelXp} XP</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Seria dni</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                {stats.streakDays}
                <span className="text-orange-500">🔥</span>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Karty nauczone</CardDescription>
              <CardTitle className="text-2xl">{stats.totalCardsLearned}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Średnia dokładność</CardDescription>
              <CardTitle className="text-2xl">{stats.averageAccuracy}%</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Pomodoro Timer */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardContent className="flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-full ${pomodoroType === 'work' ? 'bg-red-100' : 'bg-green-100'}`}>
              <Clock className={`h-8 w-8 ${pomodoroType === 'work' ? 'text-red-600' : 'text-green-600'}`} />
            </div>
            <div>
              <h3 className="font-semibold">
                {pomodoroType === 'work' ? 'Sesja skupienia' : 'Przerwa'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {pomodoroType === 'work' ? 'Skup się na nauce' : 'Odpoczywaj'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-4xl font-mono font-bold">{formatTime(pomodoroTime)}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsPomodoroRunning(!isPomodoroRunning)}
              >
                {isPomodoroRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={resetPomodoro}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Challenges */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-orange-500" />
          Dzienne wyzwania
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {dailyChallenges.map((challenge) => (
            <Card key={challenge.id} className={challenge.isCompleted ? 'bg-green-50 border-green-200' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  {challenge.isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                      +{challenge.xpReward} XP
                    </span>
                  )}
                </div>
                <CardDescription>{challenge.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{challenge.timeLimit} min</span>
                  </div>
                  {!challenge.isCompleted && (
                    <Button size="sm">Rozpocznij</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Learning Sessions */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Twoje sesje nauki</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    {getSessionIcon(session.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{session.title}</CardTitle>
                    <CardDescription className="capitalize">
                      {session.type.replace('_', ' ')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Postęp</span>
                      <span>{session.cardsReviewed}/{session.cardsTotal} kart</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${(session.cardsReviewed / session.cardsTotal) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Dokładność</p>
                      <p className="font-medium">{session.accuracy}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Seria</p>
                      <p className="font-medium">{session.streakDays} dni 🔥</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Następna powtórka: {new Date(session.nextReview).toLocaleDateString('pl-PL')}
                    </span>
                  </div>

                  <Button className="w-full" onClick={() => startSession(session.id)}>
                    <Play className="mr-2 h-4 w-4" />
                    Kontynuuj
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Create New Session Card */}
          <Card className="border-dashed hover:border-purple-300 cursor-pointer" onClick={() => window.location.href = '/super-mozg/new'}>
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px]">
              <div className="p-4 bg-purple-100 rounded-full mb-4">
                <Sparkles className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="font-medium text-lg">Nowa sesja nauki</h3>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Stwórz nowy zestaw fiszek lub rozpocznij trening pamięci
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Techniques */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Techniki pamięciowe</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <BookOpen className="h-10 w-10 text-blue-500 mb-3" />
              <h3 className="font-medium">Fiszki</h3>
              <p className="text-sm text-muted-foreground text-center">Klasyczna metoda nauki</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <RotateCcw className="h-10 w-10 text-green-500 mb-3" />
              <h3 className="font-medium">Spaced Repetition</h3>
              <p className="text-sm text-muted-foreground text-center">Powtórki w optymalnych odstępach</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <Brain className="h-10 w-10 text-purple-500 mb-3" />
              <h3 className="font-medium">Pałac Pamięci</h3>
              <p className="text-sm text-muted-foreground text-center">Wizualna mnemotechnika</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <Zap className="h-10 w-10 text-yellow-500 mb-3" />
              <h3 className="font-medium">Speed Reading</h3>
              <p className="text-sm text-muted-foreground text-center">Szybkie czytanie</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Ranking tygodnia
          </h2>
          <Button variant="link">Zobacz pełny ranking</Button>
        </div>
        <Card>
          <CardContent className="py-4">
            <div className="space-y-3">
              {[
                { rank: 1, name: 'Marta K.', score: 2450, avatar: '🧠' },
                { rank: 2, name: 'Tomek S.', score: 2380, avatar: '🎯' },
                { rank: 3, name: 'Anna W.', score: 2290, avatar: '⚡' },
              ].map((player) => (
                <div key={player.rank} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-4">
                    <span className={`text-lg font-bold ${player.rank === 1 ? 'text-yellow-500' : player.rank === 2 ? 'text-gray-400' : 'text-amber-600'}`}>
                      #{player.rank}
                    </span>
                    <span className="text-2xl">{player.avatar}</span>
                    <span className="font-medium">{player.name}</span>
                  </div>
                  <span className="font-bold">{player.score} pkt</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
