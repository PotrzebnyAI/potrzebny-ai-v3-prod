'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toaster';
import {
  Shield,
  Users,
  CreditCard,
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Server,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Settings,
  BarChart3,
  PieChart,
  Eye,
  Ban,
  Trash2,
  Edit,
  MoreVertical,
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersWeek: number;
  totalRevenue: number;
  revenueThisMonth: number;
  activeSubscriptions: number;
  churnRate: number;
  systemHealth: 'healthy' | 'degraded' | 'down';
  apiLatency: number;
  errorRate: number;
  dbConnections: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: 'active' | 'suspended' | 'pending';
  subscription: string | null;
  createdAt: string;
  lastLogin: string;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  userId: string;
  userName: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error';
}

export default function AdminPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'revenue' | 'system'>('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, activitiesRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/activities'),
      ]);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const activitiesData = await activitiesRes.json();

      if (statsData.success) setStats(statsData.data);
      if (usersData.success) setUsers(usersData.data || []);
      if (activitiesData.success) setActivities(activitiesData.data || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const suspendUser = async (userId: string) => {
    if (!confirm('Czy na pewno chcesz zawiesić to konto?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Użytkownik zawieszony');
        setUsers(users.map(u => u.id === userId ? { ...u, status: 'suspended' } : u));
      }
    } catch (error) {
      toast.error('Błąd zawieszania użytkownika');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Aktywny</span>;
      case 'suspended':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Zawieszony</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">Oczekuje</span>;
      default:
        return null;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Shield className="h-8 w-8 text-red-500" />
            Panel Administratora
          </h1>
          <p className="text-muted-foreground">Zarządzaj platformą Potrzebny.AI</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Odśwież
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Eksportuj raport
          </Button>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Ustawienia
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {['overview', 'users', 'revenue', 'system'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium ${selectedTab === tab ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
            onClick={() => setSelectedTab(tab as any)}
          >
            {tab === 'overview' && 'Przegląd'}
            {tab === 'users' && 'Użytkownicy'}
            {tab === 'revenue' && 'Przychody'}
            {tab === 'system' && 'System'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && stats && (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Użytkownicy</CardDescription>
                <CardTitle className="text-2xl flex items-center justify-between">
                  {stats.totalUsers}
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +{stats.newUsersToday} dziś
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Aktywni użytkownicy</CardDescription>
                <CardTitle className="text-2xl">{stats.activeUsers}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Przychód miesięczny</CardDescription>
                <CardTitle className="text-2xl">{stats.revenueThisMonth.toLocaleString()} PLN</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Aktywne subskrypcje</CardDescription>
                <CardTitle className="text-2xl">{stats.activeSubscriptions}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Nowi użytkownicy (7 dni)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2">
                  {[65, 45, 78, 52, 89, 43, 67].map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-primary rounded-t"
                        style={{ height: `${value * 2}px` }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Podział subskrypcji
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Educational Basic', count: 450, color: 'bg-blue-500' },
                    { name: 'Educational Pro', count: 280, color: 'bg-green-500' },
                    { name: 'Educational Premium', count: 120, color: 'bg-purple-500' },
                    { name: 'Patient Basic', count: 95, color: 'bg-yellow-500' },
                    { name: 'Doctor Pro', count: 55, color: 'bg-red-500' },
                  ].map((plan) => (
                    <div key={plan.name} className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded ${plan.color}`} />
                      <span className="flex-1">{plan.name}</span>
                      <span className="font-medium">{plan.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Ostatnia aktywność
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.slice(0, 10).map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50">
                    {getSeverityIcon(activity.severity)}
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.userName} • {new Date(activity.timestamp).toLocaleString('pl-PL')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Users Tab */}
      {selectedTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj użytkownika..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtry
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Eksportuj
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Użytkownik</th>
                    <th className="px-4 py-3 text-left font-medium">Rola</th>
                    <th className="px-4 py-3 text-left font-medium">Subskrypcja</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Ostatnie logowanie</th>
                    <th className="px-4 py-3 text-left font-medium">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize">{user.role}</td>
                      <td className="px-4 py-3">
                        {user.subscription || <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(user.status)}</td>
                      <td className="px-4 py-3">
                        {new Date(user.lastLogin).toLocaleString('pl-PL')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user.status !== 'suspended' && (
                            <Button variant="ghost" size="sm" onClick={() => suspendUser(user.id)}>
                              <Ban className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Tab */}
      {selectedTab === 'revenue' && stats && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Przychód całkowity</CardDescription>
                <CardTitle className="text-2xl">{stats.totalRevenue.toLocaleString()} PLN</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Ten miesiąc</CardDescription>
                <CardTitle className="text-2xl">{stats.revenueThisMonth.toLocaleString()} PLN</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Aktywne subskrypcje</CardDescription>
                <CardTitle className="text-2xl">{stats.activeSubscriptions}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Churn Rate</CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {stats.churnRate}%
                  <TrendingDown className="h-5 w-5 text-green-500" />
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Przychód miesięczny (12 miesięcy)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {[12500, 14200, 15800, 16400, 18900, 21200, 23500, 25800, 27400, 29100, 31500, 34200].map((value, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-medium">{(value / 1000).toFixed(1)}k</span>
                    <div
                      className="w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t"
                      style={{ height: `${(value / 35000) * 200}px` }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Tab */}
      {selectedTab === 'system' && stats && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card className={`border-2 ${stats.systemHealth === 'healthy' ? 'border-green-500 bg-green-50' : stats.systemHealth === 'degraded' ? 'border-yellow-500 bg-yellow-50' : 'border-red-500 bg-red-50'}`}>
              <CardHeader className="pb-2">
                <CardDescription>Status systemu</CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {stats.systemHealth === 'healthy' && <CheckCircle className="h-6 w-6 text-green-500" />}
                  {stats.systemHealth === 'degraded' && <AlertTriangle className="h-6 w-6 text-yellow-500" />}
                  {stats.systemHealth === 'down' && <XCircle className="h-6 w-6 text-red-500" />}
                  {stats.systemHealth === 'healthy' ? 'Zdrowy' : stats.systemHealth === 'degraded' ? 'Obniżona wydajność' : 'Awaria'}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Latencja API</CardDescription>
                <CardTitle className="text-2xl">{stats.apiLatency} ms</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Współczynnik błędów</CardDescription>
                <CardTitle className="text-2xl">{stats.errorRate}%</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Połączenia DB</CardDescription>
                <CardTitle className="text-2xl">{stats.dbConnections}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Serwery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'API Server 1', status: 'healthy', cpu: 45, memory: 62 },
                    { name: 'API Server 2', status: 'healthy', cpu: 38, memory: 58 },
                    { name: 'Worker Server', status: 'healthy', cpu: 72, memory: 81 },
                    { name: 'CDN Edge', status: 'healthy', cpu: 12, memory: 34 },
                  ].map((server) => (
                    <div key={server.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-medium">{server.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>CPU: {server.cpu}%</span>
                        <span>RAM: {server.memory}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Bazy danych
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'PostgreSQL Primary', status: 'healthy', connections: 45, size: '12.4 GB' },
                    { name: 'PostgreSQL Replica', status: 'healthy', connections: 23, size: '12.4 GB' },
                    { name: 'Redis Cache', status: 'healthy', connections: 156, size: '2.1 GB' },
                  ].map((db) => (
                    <div key={db.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-medium">{db.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{db.connections} conn</span>
                        <span>{db.size}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
