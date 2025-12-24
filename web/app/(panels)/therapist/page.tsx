'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toaster';
import {
  Heart,
  Users,
  Calendar,
  FileText,
  Clock,
  Video,
  Phone,
  MessageSquare,
  Plus,
  Search,
  Filter,
  Shield,
  Lock,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Brain,
  Smile,
  Frown,
  Meh,
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  diagnosisCode: string;
  startDate: string;
  lastSession: string;
  nextSession: string | null;
  sessionsCount: number;
  status: 'active' | 'inactive' | 'discharged';
  moodTrend: 'improving' | 'stable' | 'declining';
}

interface Session {
  id: string;
  patientId: string;
  patientName: string;
  type: 'individual' | 'group' | 'family';
  format: 'in_person' | 'video' | 'phone';
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes: string;
}

interface TherapistStats {
  totalPatients: number;
  activePatients: number;
  sessionsThisWeek: number;
  sessionsThisMonth: number;
  averageSessionDuration: number;
  patientImprovement: number;
}

export default function TherapistPanel() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<TherapistStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'sessions' | 'patients' | 'notes'>('sessions');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [newNote, setNewNote] = useState({
    patientId: '',
    sessionType: 'individual',
    mood: 5,
    anxiety: 5,
    content: '',
    treatmentPlan: '',
    homework: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patientsRes, sessionsRes, statsRes] = await Promise.all([
        fetch('/api/panel/therapist/patients'),
        fetch('/api/panel/therapist/sessions'),
        fetch('/api/panel/therapist/stats'),
      ]);

      const patientsData = await patientsRes.json();
      const sessionsData = await sessionsRes.json();
      const statsData = await statsRes.json();

      if (patientsData.success) setPatients(patientsData.data || []);
      if (sessionsData.success) setSessions(sessionsData.data || []);
      if (statsData.success) setStats(statsData.data);
    } catch (error) {
      console.error('Error fetching therapist data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNote = async () => {
    try {
      const response = await fetch('/api/panel/therapist/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Notatka została zapisana i zaszyfrowana');
        setShowNoteModal(false);
        setNewNote({
          patientId: '',
          sessionType: 'individual',
          mood: 5,
          anxiety: 5,
          content: '',
          treatmentPlan: '',
          homework: '',
        });
      } else {
        toast.error(data.error || 'Błąd zapisywania notatki');
      }
    } catch (error) {
      toast.error('Błąd połączenia');
    }
  };

  const getMoodIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <Smile className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <Frown className="h-4 w-4 text-red-500" />;
      default:
        return <Meh className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSessionFormatIcon = (format: string) => {
    switch (format) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const todaysSessions = sessions.filter(s => {
    const today = new Date().toISOString().split('T')[0];
    return s.date === today && s.status === 'scheduled';
  });

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
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
            <Heart className="h-8 w-8 text-pink-500" />
            Panel Terapeuty
          </h1>
          <p className="text-muted-foreground">Zarządzaj pacjentami i sesjami terapeutycznymi</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Kalendarz
          </Button>
          <Button onClick={() => setShowNoteModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nowa notatka
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pacjenci</CardDescription>
              <CardTitle className="text-2xl">{stats.totalPatients}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Aktywni</CardDescription>
              <CardTitle className="text-2xl">{stats.activePatients}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Ten tydzień</CardDescription>
              <CardTitle className="text-2xl">{stats.sessionsThisWeek}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Ten miesiąc</CardDescription>
              <CardTitle className="text-2xl">{stats.sessionsThisMonth}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Śr. czas sesji</CardDescription>
              <CardTitle className="text-2xl">{stats.averageSessionDuration} min</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-2">
              <CardDescription>Poprawa pacjentów</CardDescription>
              <CardTitle className="text-2xl text-green-700 flex items-center gap-2">
                {stats.patientImprovement}%
                <TrendingUp className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Today's Sessions */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Dzisiejsze sesje</h2>
        {todaysSessions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {todaysSessions.map((session) => (
              <Card key={session.id} className="border-l-4 border-l-pink-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{session.patientName}</CardTitle>
                    {getSessionFormatIcon(session.format)}
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {session.time} ({session.duration} min)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <span className="capitalize">{session.type === 'individual' ? 'Indywidualna' : session.type === 'group' ? 'Grupowa' : 'Rodzinna'}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Rozpocznij
                    </Button>
                    <Button size="sm" variant="outline">
                      <FileText className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Brak zaplanowanych sesji na dziś</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-medium ${selectedTab === 'sessions' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setSelectedTab('sessions')}
        >
          Wszystkie sesje
        </button>
        <button
          className={`px-4 py-2 font-medium ${selectedTab === 'patients' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setSelectedTab('patients')}
        >
          Pacjenci
        </button>
        <button
          className={`px-4 py-2 font-medium ${selectedTab === 'notes' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setSelectedTab('notes')}
        >
          Notatki
        </button>
      </div>

      {/* Patients List */}
      {selectedTab === 'patients' && (
        <section>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj pacjenta..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtry
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPatients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{patient.name}</CardTitle>
                    {getMoodIcon(patient.moodTrend)}
                  </div>
                  <CardDescription>{patient.diagnosisCode}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Sesje</p>
                        <p className="font-medium">{patient.sessionsCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Od</p>
                        <p className="font-medium">{new Date(patient.startDate).toLocaleDateString('pl-PL')}</p>
                      </div>
                    </div>

                    {patient.nextSession && (
                      <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                        <Calendar className="h-4 w-4" />
                        <span>Następna: {new Date(patient.nextSession).toLocaleDateString('pl-PL')}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                        setSelectedPatient(patient);
                        setNewNote({ ...newNote, patientId: patient.id });
                        setShowNoteModal(true);
                      }}>
                        <FileText className="mr-1 h-3 w-3" />
                        Notatka
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Sessions List */}
      {selectedTab === 'sessions' && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Pacjent</th>
                  <th className="px-4 py-3 text-left font-medium">Data</th>
                  <th className="px-4 py-3 text-left font-medium">Godzina</th>
                  <th className="px-4 py-3 text-left font-medium">Typ</th>
                  <th className="px-4 py-3 text-left font-medium">Format</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{session.patientName}</td>
                    <td className="px-4 py-3">{new Date(session.date).toLocaleDateString('pl-PL')}</td>
                    <td className="px-4 py-3">{session.time}</td>
                    <td className="px-4 py-3 capitalize">
                      {session.type === 'individual' ? 'Indywidualna' : session.type === 'group' ? 'Grupowa' : 'Rodzinna'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getSessionFormatIcon(session.format)}
                        <span className="capitalize">
                          {session.format === 'in_person' ? 'Osobista' : session.format === 'video' ? 'Wideo' : 'Telefon'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        session.status === 'completed' ? 'bg-green-100 text-green-700' :
                        session.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                        session.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {session.status === 'completed' ? 'Zakończona' :
                         session.status === 'scheduled' ? 'Zaplanowana' :
                         session.status === 'cancelled' ? 'Anulowana' : 'Nieobecność'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Notes Tab */}
      {selectedTab === 'notes' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="flex items-center gap-4 py-6">
            <Lock className="h-12 w-12 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">Notatki terapeutyczne są szyfrowane</h3>
              <p className="text-sm text-blue-700 mt-1">
                Wszystkie notatki są szyfrowane algorytmem AES-256-GCM zgodnie z RODO Art. 9.
                Tylko Ty masz dostęp do treści notatek.
              </p>
              <Button className="mt-4" onClick={() => setShowNoteModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nowa notatka
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* GDPR Notice */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="flex items-center gap-4 py-4">
          <Shield className="h-8 w-8 text-purple-600" />
          <div>
            <p className="font-medium text-purple-900">Dane pacjentów są chronione</p>
            <p className="text-sm text-purple-700">
              Platforma jest zgodna z RODO Art. 9 (dane szczególnych kategorii) oraz standardami HIPAA.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Create Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Nowa notatka terapeutyczna
              </CardTitle>
              <CardDescription>Notatka zostanie zaszyfrowana algorytmem AES-256-GCM</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pacjent</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={newNote.patientId}
                    onChange={(e) => setNewNote({ ...newNote, patientId: e.target.value })}
                  >
                    <option value="">Wybierz pacjenta</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Typ sesji</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={newNote.sessionType}
                    onChange={(e) => setNewNote({ ...newNote, sessionType: e.target.value })}
                  >
                    <option value="individual">Indywidualna</option>
                    <option value="group">Grupowa</option>
                    <option value="family">Rodzinna</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nastrój pacjenta (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={newNote.mood}
                    onChange={(e) => setNewNote({ ...newNote, mood: parseInt(e.target.value) || 5 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Poziom lęku (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={newNote.anxiety}
                    onChange={(e) => setNewNote({ ...newNote, anxiety: parseInt(e.target.value) || 5 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notatki z sesji</Label>
                <textarea
                  className="w-full min-h-[150px] px-3 py-2 border rounded-md"
                  placeholder="Opisz przebieg sesji, obserwacje, postępy..."
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Plan terapii</Label>
                <textarea
                  className="w-full min-h-[80px] px-3 py-2 border rounded-md"
                  placeholder="Cele i plan na następne sesje..."
                  value={newNote.treatmentPlan}
                  onChange={(e) => setNewNote({ ...newNote, treatmentPlan: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Zadanie domowe</Label>
                <Input
                  placeholder="Zadanie dla pacjenta do następnej sesji"
                  value={newNote.homework}
                  onChange={(e) => setNewNote({ ...newNote, homework: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Ta notatka zostanie zaszyfrowana i będzie dostępna tylko dla Ciebie.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowNoteModal(false)}>
                  Anuluj
                </Button>
                <Button onClick={createNote} disabled={!newNote.patientId || !newNote.content}>
                  <Lock className="mr-2 h-4 w-4" />
                  Zapisz zaszyfrowaną notatkę
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
