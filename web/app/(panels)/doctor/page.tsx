'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toaster';
import {
  Stethoscope,
  Users,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Video,
  MessageSquare,
  Plus,
  Search,
  Filter,
  Download,
  Shield,
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  lastVisit: string;
  nextAppointment: string | null;
  notes: number;
  status: 'active' | 'inactive' | 'archived';
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  type: 'in_person' | 'video' | 'phone';
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes: string;
}

interface DoctorStats {
  totalPatients: number;
  activePatients: number;
  appointmentsToday: number;
  appointmentsWeek: number;
  completedThisMonth: number;
  cancelledThisMonth: number;
}

export default function DoctorPanel() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'patients' | 'appointments' | 'schedule'>('appointments');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patientsRes, appointmentsRes, statsRes] = await Promise.all([
        fetch('/api/panel/doctor/patients'),
        fetch('/api/panel/doctor/appointments'),
        fetch('/api/panel/doctor/stats'),
      ]);

      const patientsData = await patientsRes.json();
      const appointmentsData = await appointmentsRes.json();
      const statsData = await statsRes.json();

      if (patientsData.success) setPatients(patientsData.data || []);
      if (appointmentsData.success) setAppointments(appointmentsData.data || []);
      if (statsData.success) setStats(statsData.data);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Zaplanowana</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Zakończona</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Anulowana</span>;
      case 'no_show':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">Nieobecność</span>;
      default:
        return null;
    }
  };

  const completeAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/panel/doctor/appointments/${appointmentId}/complete`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Wizyta zakończona');
        setAppointments(appointments.map(a =>
          a.id === appointmentId ? { ...a, status: 'completed' } : a
        ));
      }
    } catch (error) {
      toast.error('Błąd aktualizacji wizyty');
    }
  };

  const todaysAppointments = appointments.filter(a => {
    const today = new Date().toISOString().split('T')[0];
    return a.date === today && a.status === 'scheduled';
  });

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
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
            <Stethoscope className="h-8 w-8 text-primary" />
            Panel Lekarza
          </h1>
          <p className="text-muted-foreground">Zarządzaj pacjentami i wizytami</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Kalendarz
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nowa wizyta
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
              <CardDescription>Dziś</CardDescription>
              <CardTitle className="text-2xl">{stats.appointmentsToday}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Ten tydzień</CardDescription>
              <CardTitle className="text-2xl">{stats.appointmentsWeek}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Zakończone</CardDescription>
              <CardTitle className="text-2xl text-green-600">{stats.completedThisMonth}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Anulowane</CardDescription>
              <CardTitle className="text-2xl text-red-600">{stats.cancelledThisMonth}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Today's Appointments */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Dzisiejsze wizyty</h2>
        {todaysAppointments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {todaysAppointments.map((appointment) => (
              <Card key={appointment.id} className="border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{appointment.patientName}</CardTitle>
                    {getAppointmentTypeIcon(appointment.type)}
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {appointment.time} ({appointment.duration} min)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => completeAppointment(appointment.id)}>
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Zakończ
                    </Button>
                    <Button size="sm" variant="outline">
                      <FileText className="h-3 w-3" />
                    </Button>
                    {appointment.type === 'video' && (
                      <Button size="sm" variant="outline">
                        <Video className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Brak zaplanowanych wizyt na dziś</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-medium ${selectedTab === 'appointments' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setSelectedTab('appointments')}
        >
          Wszystkie wizyty
        </button>
        <button
          className={`px-4 py-2 font-medium ${selectedTab === 'patients' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setSelectedTab('patients')}
        >
          Pacjenci
        </button>
        <button
          className={`px-4 py-2 font-medium ${selectedTab === 'schedule' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setSelectedTab('schedule')}
        >
          Harmonogram
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

          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Pacjent</th>
                    <th className="px-4 py-3 text-left font-medium">Kontakt</th>
                    <th className="px-4 py-3 text-left font-medium">Ostatnia wizyta</th>
                    <th className="px-4 py-3 text-left font-medium">Następna wizyta</th>
                    <th className="px-4 py-3 text-left font-medium">Notatki</th>
                    <th className="px-4 py-3 text-left font-medium">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="border-t hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(patient.dateOfBirth).toLocaleDateString('pl-PL')}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p>{patient.email}</p>
                          <p className="text-muted-foreground">{patient.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {new Date(patient.lastVisit).toLocaleDateString('pl-PL')}
                      </td>
                      <td className="px-4 py-3">
                        {patient.nextAppointment
                          ? new Date(patient.nextAppointment).toLocaleDateString('pl-PL')
                          : <span className="text-muted-foreground">-</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{patient.notes}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>
      )}

      {/* All Appointments */}
      {selectedTab === 'appointments' && (
        <section>
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Pacjent</th>
                    <th className="px-4 py-3 text-left font-medium">Data</th>
                    <th className="px-4 py-3 text-left font-medium">Godzina</th>
                    <th className="px-4 py-3 text-left font-medium">Typ</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="border-t hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{appointment.patientName}</td>
                      <td className="px-4 py-3">{new Date(appointment.date).toLocaleDateString('pl-PL')}</td>
                      <td className="px-4 py-3">{appointment.time}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getAppointmentTypeIcon(appointment.type)}
                          <span className="capitalize">{appointment.type === 'in_person' ? 'Osobista' : appointment.type === 'video' ? 'Wideo' : 'Telefon'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(appointment.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {appointment.status === 'scheduled' && (
                            <Button variant="ghost" size="sm" onClick={() => completeAppointment(appointment.id)}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
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
        </section>
      )}

      {/* Schedule */}
      {selectedTab === 'schedule' && (
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Harmonogram pracy</CardTitle>
              <CardDescription>Ustaw godziny przyjęć i dostępność</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek'].map((day) => (
                  <div key={day} className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="font-medium">{day}</span>
                    <div className="flex items-center gap-4">
                      <Input type="time" defaultValue="09:00" className="w-32" />
                      <span>-</span>
                      <Input type="time" defaultValue="17:00" className="w-32" />
                      <Button variant="ghost" size="sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-4">Zapisz harmonogram</Button>
            </CardContent>
          </Card>
        </section>
      )}

      {/* GDPR Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="flex items-center gap-4 py-4">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <p className="font-medium text-blue-900">Dane pacjentów są chronione</p>
            <p className="text-sm text-blue-700">
              Wszystkie dane medyczne są szyfrowane zgodnie z RODO (Art. 9) i standardami HIPAA.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
