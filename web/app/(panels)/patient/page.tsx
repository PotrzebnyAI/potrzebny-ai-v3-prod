'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toaster';
import {
  Heart,
  Plus,
  Calendar,
  TrendingUp,
  Clock,
  Edit,
  Trash2,
  Lock,
  Smile,
  Frown,
  Meh,
} from 'lucide-react';

interface TherapyNote {
  id: string;
  sessionDate: string;
  content: string;
  moodRating: number;
  energyLevel: number;
  anxietyLevel: number;
  tags: string[];
  createdAt: string;
}

export default function PatientPanelPage() {
  const [notes, setNotes] = useState<TherapyNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewNote, setShowNewNote] = useState(false);
  const [newNote, setNewNote] = useState({
    content: '',
    sessionDate: new Date().toISOString().split('T')[0],
    moodRating: 5,
    energyLevel: 5,
    anxietyLevel: 5,
    tags: [] as string[],
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/panel/patient/notes');
      const data = await response.json();
      if (data.success) {
        setNotes(data.data);
      }
    } catch (error) {
      toast.error('Błąd wczytywania notatek');
    } finally {
      setIsLoading(false);
    }
  };

  const createNote = async () => {
    try {
      const response = await fetch('/api/panel/patient/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Notatka zapisana');
        setShowNewNote(false);
        setNewNote({
          content: '',
          sessionDate: new Date().toISOString().split('T')[0],
          moodRating: 5,
          energyLevel: 5,
          anxietyLevel: 5,
          tags: [],
        });
        fetchNotes();
      } else {
        toast.error(data.error || 'Błąd zapisu');
      }
    } catch (error) {
      toast.error('Błąd zapisu notatki');
    }
  };

  const getMoodIcon = (rating: number) => {
    if (rating >= 7) return <Smile className="h-5 w-5 text-green-500" />;
    if (rating >= 4) return <Meh className="h-5 w-5 text-yellow-500" />;
    return <Frown className="h-5 w-5 text-red-500" />;
  };

  const stats = [
    { label: 'Notatek', value: notes.length, icon: Edit },
    { label: 'Średni nastrój', value: notes.length > 0 ? (notes.reduce((a, n) => a + n.moodRating, 0) / notes.length).toFixed(1) : '-', icon: Heart },
    { label: 'Ten tydzień', value: notes.filter(n => new Date(n.sessionDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length, icon: Calendar },
    { label: 'Seria dni', value: 3, icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Lock className="h-8 w-8 text-primary" />
            Panel Pacjenta
          </h1>
          <p className="text-muted-foreground">
            Twoje notatki są szyfrowane AES-256-GCM i w pełni prywatne
          </p>
        </div>
        <Button onClick={() => setShowNewNote(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nowa notatka
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showNewNote && (
        <Card>
          <CardHeader>
            <CardTitle>Nowa notatka terapeutyczna</CardTitle>
            <CardDescription>Zapisz swoje myśli i uczucia - wszystko jest zaszyfrowane</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Data sesji</Label>
                <Input
                  type="date"
                  value={newNote.sessionDate}
                  onChange={(e) => setNewNote({ ...newNote, sessionDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Nastrój (1-10)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={newNote.moodRating}
                    onChange={(e) => setNewNote({ ...newNote, moodRating: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="font-bold w-8 text-center">{newNote.moodRating}</span>
                  {getMoodIcon(newNote.moodRating)}
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Poziom energii (1-10)</Label>
                <Input
                  type="range"
                  min="1"
                  max="10"
                  value={newNote.energyLevel}
                  onChange={(e) => setNewNote({ ...newNote, energyLevel: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Poziom lęku (1-10)</Label>
                <Input
                  type="range"
                  min="1"
                  max="10"
                  value={newNote.anxietyLevel}
                  onChange={(e) => setNewNote({ ...newNote, anxietyLevel: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label>Twoje myśli i uczucia</Label>
              <textarea
                className="w-full min-h-[200px] p-3 rounded-md border bg-background resize-none"
                placeholder="Opisz jak się dziś czujesz..."
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowNewNote(false)}>Anuluj</Button>
              <Button onClick={createNote} disabled={!newNote.content}>
                <Lock className="mr-2 h-4 w-4" />
                Zapisz (zaszyfrowane)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-4">Twoje notatki</h2>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Brak notatek</h3>
              <p className="text-muted-foreground">Zacznij dokumentować swoją podróż</p>
              <Button className="mt-4" onClick={() => setShowNewNote(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Dodaj pierwszą notatkę
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {notes.map((note) => (
              <Card key={note.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getMoodIcon(note.moodRating)}
                      <CardTitle className="text-lg">
                        {new Date(note.sessionDate).toLocaleDateString('pl-PL', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost"><Edit className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <CardDescription>
                    Nastrój: {note.moodRating}/10 | Energia: {note.energyLevel}/10 | Lęk: {note.anxietyLevel}/10
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-4">{note.content}</p>
                  {note.tags.length > 0 && (
                    <div className="flex gap-1 mt-3 flex-wrap">
                      {note.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-muted rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
