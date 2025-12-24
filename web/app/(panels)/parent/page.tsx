'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toaster';
import {
  Users,
  BookOpen,
  Trophy,
  Clock,
  TrendingUp,
  Calendar,
  Bell,
  Shield,
  Eye,
  Plus,
  Settings,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Star,
  Award,
  Target,
} from 'lucide-react';

interface Child {
  id: string;
  name: string;
  age: number;
  avatar: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  streakDays: number;
  todayMinutes: number;
  weeklyGoal: number;
  weeklyProgress: number;
  lastActive: string;
  subjects: SubjectProgress[];
}

interface SubjectProgress {
  id: string;
  name: string;
  progress: number;
  grade: string;
  lastActivity: string;
}

interface ParentStats {
  totalChildren: number;
  totalLearningTime: number;
  averageProgress: number;
  achievementsUnlocked: number;
}

interface Activity {
  id: string;
  childId: string;
  childName: string;
  type: string;
  description: string;
  timestamp: string;
  xpEarned: number;
}

export default function ParentPanel() {
  const [children, setChildren] = useState<Child[]>([]);
  const [stats, setStats] = useState<ParentStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [showAddChildModal, setShowAddChildModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [childrenRes, statsRes, activitiesRes] = await Promise.all([
        fetch('/api/panel/parent/children'),
        fetch('/api/panel/parent/stats'),
        fetch('/api/panel/parent/activities'),
      ]);

      const childrenData = await childrenRes.json();
      const statsData = await statsRes.json();
      const activitiesData = await activitiesRes.json();

      if (childrenData.success) {
        setChildren(childrenData.data || []);
        if (childrenData.data?.length > 0) {
          setSelectedChild(childrenData.data[0]);
        }
      }
      if (statsData.success) setStats(statsData.data);
      if (activitiesData.success) setActivities(activitiesData.data || []);
    } catch (error) {
      console.error('Error fetching parent data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lesson_completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'quiz_passed':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'achievement_unlocked':
        return <Award className="h-4 w-4 text-purple-500" />;
      case 'streak_continued':
        return <Star className="h-4 w-4 text-orange-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-blue-500" />;
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
            <Users className="h-8 w-8 text-blue-500" />
            Panel Rodzica
          </h1>
          <p className="text-muted-foreground">Monitoruj postępy nauki swoich dzieci</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Bell className="mr-2 h-4 w-4" />
            Powiadomienia
          </Button>
          <Button onClick={() => setShowAddChildModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Dodaj dziecko
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Dzieci</CardDescription>
              <CardTitle className="text-2xl">{stats.totalChildren}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Czas nauki dziś</CardDescription>
              <CardTitle className="text-2xl">{stats.totalLearningTime} min</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Średni postęp</CardDescription>
              <CardTitle className="text-2xl">{stats.averageProgress}%</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Odblokowane osiągnięcia</CardDescription>
              <CardTitle className="text-2xl">{stats.achievementsUnlocked}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Children Selector */}
      {children.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {children.map((child) => (
            <Card
              key={child.id}
              className={`cursor-pointer min-w-[200px] transition-all ${selectedChild?.id === child.id ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
              onClick={() => setSelectedChild(child)}
            >
              <CardContent className="flex items-center gap-4 py-4">
                <span className="text-4xl">{child.avatar}</span>
                <div>
                  <p className="font-medium">{child.name}</p>
                  <p className="text-sm text-muted-foreground">Poziom {child.level}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Selected Child Details */}
      {selectedChild && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Progress */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{selectedChild.avatar}</span>
                    <div>
                      <CardTitle className="text-2xl">{selectedChild.name}</CardTitle>
                      <CardDescription>{selectedChild.age} lat</CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Poziom</p>
                    <p className="text-3xl font-bold">{selectedChild.level}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Postęp XP</span>
                      <span>{selectedChild.xp}/{selectedChild.nextLevelXp}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                        style={{ width: `${(selectedChild.xp / selectedChild.nextLevelXp) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-500">{selectedChild.streakDays} 🔥</p>
                    <p className="text-sm text-muted-foreground">Seria dni</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{selectedChild.todayMinutes}</p>
                    <p className="text-sm text-muted-foreground">Minut dziś</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Goal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Cel tygodniowy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>{selectedChild.weeklyProgress} / {selectedChild.weeklyGoal} minut</span>
                    <span>{Math.round((selectedChild.weeklyProgress / selectedChild.weeklyGoal) * 100)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-4">
                    <div
                      className="bg-green-500 h-4 rounded-full transition-all"
                      style={{ width: `${Math.min((selectedChild.weeklyProgress / selectedChild.weeklyGoal) * 100, 100)}%` }}
                    />
                  </div>
                  {selectedChild.weeklyProgress >= selectedChild.weeklyGoal && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Cel osiągnięty! Świetna robota!</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Subject Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Postępy w przedmiotach</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedChild.subjects.map((subject) => (
                    <div key={subject.id} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{subject.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{subject.progress}%</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            subject.grade === 'A' ? 'bg-green-100 text-green-700' :
                            subject.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                            subject.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {subject.grade}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${subject.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Ostatnia aktywność
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities
                    .filter(a => a.childId === selectedChild.id)
                    .slice(0, 10)
                    .map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString('pl-PL')}
                          </p>
                        </div>
                        {activity.xpEarned > 0 && (
                          <span className="text-xs font-medium text-green-600">+{activity.xpEarned} XP</span>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Parental Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Kontrola rodzicielska
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Limit dzienny</span>
                  </div>
                  <Button variant="outline" size="sm">
                    60 min
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Raporty tygodniowe</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Włączone
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Powiadomienia</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Włączone
                  </Button>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <Settings className="mr-2 h-4 w-4" />
                  Więcej ustawień
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Statystyki tygodnia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Lekcje ukończone</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Quizy zaliczone</span>
                    <span className="font-medium">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Średnia ocena</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Nowe odznaki</span>
                    <span className="font-medium">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Empty State */}
      {children.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Dodaj swoje dziecko</h3>
            <p className="text-muted-foreground text-center mb-6">
              Połącz konto dziecka, aby monitorować jego postępy w nauce
            </p>
            <Button onClick={() => setShowAddChildModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Dodaj dziecko
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Child Modal */}
      {showAddChildModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Dodaj dziecko</CardTitle>
              <CardDescription>Połącz konto dziecka z Twoim kontem rodzica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="childCode">Kod połączenia</Label>
                <Input
                  id="childCode"
                  placeholder="Wpisz kod z konta dziecka"
                />
                <p className="text-xs text-muted-foreground">
                  Kod znajdziesz w ustawieniach konta dziecka w sekcji "Połącz z rodzicem"
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddChildModal(false)}>
                  Anuluj
                </Button>
                <Button>
                  Połącz konto
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
