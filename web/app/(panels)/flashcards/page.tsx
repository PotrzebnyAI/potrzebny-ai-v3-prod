'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toaster';
import {
  BookOpen,
  Plus,
  RotateCcw,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Clock,
  Brain,
  Star,
  Trash2,
  Edit,
  Play,
  Pause,
  Volume2,
  Settings,
  Trophy,
  Target,
  Zap,
} from 'lucide-react';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  deckId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  nextReview: string;
  repetitions: number;
  easeFactor: number;
  interval: number;
  lastReviewed: string | null;
}

interface Deck {
  id: string;
  name: string;
  description: string;
  category: string;
  cardsCount: number;
  dueCount: number;
  masteredCount: number;
  lastStudied: string | null;
  createdAt: string;
}

interface StudySession {
  deckId: string;
  cards: Flashcard[];
  currentIndex: number;
  correct: number;
  incorrect: number;
  startTime: number;
}

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [studySession, setStudySession] = useState<StudySession | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const [newDeck, setNewDeck] = useState({
    name: '',
    description: '',
    category: 'general',
  });

  const [newCard, setNewCard] = useState({
    front: '',
    back: '',
    difficulty: 'medium',
  });

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const response = await fetch('/api/panel/flashcards/decks');
      const data = await response.json();
      if (data.success) {
        setDecks(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching decks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDeck = async () => {
    try {
      const response = await fetch('/api/panel/flashcards/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeck),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Talia została utworzona');
        setDecks([data.data, ...decks]);
        setShowCreateDeck(false);
        setNewDeck({ name: '', description: '', category: 'general' });
      } else {
        toast.error(data.error || 'Błąd tworzenia talii');
      }
    } catch (error) {
      toast.error('Błąd połączenia');
    }
  };

  const addCard = async () => {
    if (!selectedDeck) return;

    try {
      const response = await fetch(`/api/panel/flashcards/decks/${selectedDeck.id}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCard),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Fiszka została dodana');
        setDecks(decks.map(d => d.id === selectedDeck.id ? { ...d, cardsCount: d.cardsCount + 1 } : d));
        setNewCard({ front: '', back: '', difficulty: 'medium' });
      } else {
        toast.error(data.error || 'Błąd dodawania fiszki');
      }
    } catch (error) {
      toast.error('Błąd połączenia');
    }
  };

  const startStudySession = async (deckId: string) => {
    try {
      const response = await fetch(`/api/panel/flashcards/decks/${deckId}/study`);
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        setStudySession({
          deckId,
          cards: data.data,
          currentIndex: 0,
          correct: 0,
          incorrect: 0,
          startTime: Date.now(),
        });
        setShowAnswer(false);
        setIsFlipped(false);
      } else {
        toast.error('Brak fiszek do nauki');
      }
    } catch (error) {
      toast.error('Błąd rozpoczynania sesji');
    }
  };

  const handleAnswer = async (quality: number) => {
    if (!studySession) return;

    const currentCard = studySession.cards[studySession.currentIndex];

    // Update card with SM-2 algorithm
    try {
      await fetch(`/api/panel/flashcards/cards/${currentCard.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quality }),
      });
    } catch (error) {
      console.error('Error updating card:', error);
    }

    // Move to next card
    if (studySession.currentIndex < studySession.cards.length - 1) {
      setStudySession({
        ...studySession,
        currentIndex: studySession.currentIndex + 1,
        correct: quality >= 3 ? studySession.correct + 1 : studySession.correct,
        incorrect: quality < 3 ? studySession.incorrect + 1 : studySession.incorrect,
      });
      setShowAnswer(false);
      setIsFlipped(false);
    } else {
      // Session complete
      const totalTime = Math.floor((Date.now() - studySession.startTime) / 1000);
      toast.success(`Sesja zakończona! ${studySession.correct + (quality >= 3 ? 1 : 0)}/${studySession.cards.length} poprawnych odpowiedzi w ${Math.floor(totalTime / 60)}:${(totalTime % 60).toString().padStart(2, '0')}`);
      setStudySession(null);
      fetchDecks(); // Refresh deck stats
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
    setShowAnswer(true);
  };

  if (studySession) {
    const currentCard = studySession.cards[studySession.currentIndex];
    const progress = ((studySession.currentIndex + 1) / studySession.cards.length) * 100;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        {/* Progress */}
        <div className="w-full max-w-2xl mb-8">
          <div className="flex justify-between mb-2 text-sm">
            <span>{studySession.currentIndex + 1} / {studySession.cards.length}</span>
            <div className="flex gap-4">
              <span className="text-green-600">✓ {studySession.correct}</span>
              <span className="text-red-600">✗ {studySession.incorrect}</span>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div
          className={`w-full max-w-2xl h-96 perspective-1000 cursor-pointer transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}
          onClick={flipCard}
        >
          <Card className="w-full h-full flex items-center justify-center relative">
            <CardContent className="text-center p-8">
              <p className="text-2xl">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
              {!showAnswer && (
                <p className="text-sm text-muted-foreground mt-4">
                  Kliknij, aby zobaczyć odpowiedź
                </p>
              )}
            </CardContent>
            <div className="absolute top-4 right-4">
              <span className={`px-2 py-1 rounded text-xs ${
                currentCard.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                currentCard.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {currentCard.difficulty === 'easy' ? 'Łatwe' : currentCard.difficulty === 'hard' ? 'Trudne' : 'Średnie'}
              </span>
            </div>
          </Card>
        </div>

        {/* Answer Buttons */}
        {showAnswer && (
          <div className="w-full max-w-2xl mt-8 grid grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 flex flex-col" onClick={() => handleAnswer(1)}>
              <span className="text-red-600 font-bold">Źle</span>
              <span className="text-xs text-muted-foreground">Powtórz</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col" onClick={() => handleAnswer(2)}>
              <span className="text-orange-600 font-bold">Trudne</span>
              <span className="text-xs text-muted-foreground">~1 dzień</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col" onClick={() => handleAnswer(3)}>
              <span className="text-blue-600 font-bold">Dobrze</span>
              <span className="text-xs text-muted-foreground">~3 dni</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col" onClick={() => handleAnswer(5)}>
              <span className="text-green-600 font-bold">Łatwe</span>
              <span className="text-xs text-muted-foreground">~7 dni</span>
            </Button>
          </div>
        )}

        {/* Controls */}
        <div className="mt-8 flex gap-4">
          <Button variant="outline" onClick={() => setStudySession(null)}>
            <X className="mr-2 h-4 w-4" />
            Zakończ sesję
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-muted rounded" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 bg-muted rounded" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-blue-500" />
            Fiszki
          </h1>
          <p className="text-muted-foreground">Ucz się efektywnie metodą powtórek rozłożonych w czasie</p>
        </div>
        <Button onClick={() => setShowCreateDeck(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nowa talia
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Talie</CardDescription>
            <CardTitle className="text-2xl">{decks.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Wszystkie fiszki</CardDescription>
            <CardTitle className="text-2xl">{decks.reduce((acc, d) => acc + d.cardsCount, 0)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Do powtórki dziś</CardDescription>
            <CardTitle className="text-2xl text-orange-600">{decks.reduce((acc, d) => acc + d.dueCount, 0)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Opanowane</CardDescription>
            <CardTitle className="text-2xl text-green-600">{decks.reduce((acc, d) => acc + d.masteredCount, 0)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Decks Grid */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Twoje talie</h2>
        {decks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => (
              <Card key={deck.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{deck.name}</span>
                    {deck.dueCount > 0 && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                        {deck.dueCount} do powtórki
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">{deck.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <p className="font-medium">{deck.cardsCount}</p>
                        <p className="text-muted-foreground">Fiszek</p>
                      </div>
                      <div>
                        <p className="font-medium text-orange-600">{deck.dueCount}</p>
                        <p className="text-muted-foreground">Do nauki</p>
                      </div>
                      <div>
                        <p className="font-medium text-green-600">{deck.masteredCount}</p>
                        <p className="text-muted-foreground">Opanowane</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${deck.cardsCount > 0 ? (deck.masteredCount / deck.cardsCount) * 100 : 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-right">
                        {deck.cardsCount > 0 ? Math.round((deck.masteredCount / deck.cardsCount) * 100) : 0}% opanowane
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => startStudySession(deck.id)}
                        disabled={deck.dueCount === 0}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {deck.dueCount > 0 ? 'Ucz się' : 'Brak do nauki'}
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setSelectedDeck(deck);
                        setShowAddCard(true);
                      }}>
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Create New Deck Card */}
            <Card
              className="border-dashed hover:border-primary cursor-pointer transition-colors"
              onClick={() => setShowCreateDeck(true)}
            >
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[250px]">
                <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium">Utwórz nową talię</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Dodaj własne fiszki do nauki
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Brak talii</h3>
              <p className="text-muted-foreground text-center mb-6">
                Utwórz swoją pierwszą talię fiszek, aby rozpocząć naukę
              </p>
              <Button onClick={() => setShowCreateDeck(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Utwórz talię
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Spaced Repetition Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="flex items-center gap-4 py-6">
          <Brain className="h-12 w-12 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900">Algorytm SM-2 (Spaced Repetition)</h3>
            <p className="text-sm text-blue-700 mt-1">
              Fiszki używają algorytmu powtórek rozłożonych w czasie, który automatycznie dostosowuje
              częstotliwość powtórek do Twojego postępu. Im lepiej pamiętasz kartę, tym rzadziej będzie się pojawiać.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Create Deck Modal */}
      {showCreateDeck && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Nowa talia</CardTitle>
              <CardDescription>Utwórz nową talię fiszek</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nazwa talii</Label>
                <Input
                  id="name"
                  value={newDeck.name}
                  onChange={(e) => setNewDeck({ ...newDeck, name: e.target.value })}
                  placeholder="np. Angielski - słówka B2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Opis</Label>
                <textarea
                  id="description"
                  className="w-full min-h-[80px] px-3 py-2 border rounded-md"
                  value={newDeck.description}
                  onChange={(e) => setNewDeck({ ...newDeck, description: e.target.value })}
                  placeholder="Krótki opis talii..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategoria</Label>
                <select
                  id="category"
                  className="w-full px-3 py-2 border rounded-md"
                  value={newDeck.category}
                  onChange={(e) => setNewDeck({ ...newDeck, category: e.target.value })}
                >
                  <option value="general">Ogólne</option>
                  <option value="languages">Języki</option>
                  <option value="science">Nauka</option>
                  <option value="history">Historia</option>
                  <option value="medicine">Medycyna</option>
                  <option value="programming">Programowanie</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDeck(false)}>
                  Anuluj
                </Button>
                <Button onClick={createDeck} disabled={!newDeck.name}>
                  Utwórz talię
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Card Modal */}
      {showAddCard && selectedDeck && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Dodaj fiszkę</CardTitle>
              <CardDescription>Dodaj nową fiszkę do talii "{selectedDeck.name}"</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="front">Przód (pytanie)</Label>
                <textarea
                  id="front"
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                  value={newCard.front}
                  onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                  placeholder="Wpisz pytanie lub termin..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="back">Tył (odpowiedź)</Label>
                <textarea
                  id="back"
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                  value={newCard.back}
                  onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                  placeholder="Wpisz odpowiedź lub definicję..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Trudność</Label>
                <select
                  id="difficulty"
                  className="w-full px-3 py-2 border rounded-md"
                  value={newCard.difficulty}
                  onChange={(e) => setNewCard({ ...newCard, difficulty: e.target.value })}
                >
                  <option value="easy">Łatwa</option>
                  <option value="medium">Średnia</option>
                  <option value="hard">Trudna</option>
                </select>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => {
                  setShowAddCard(false);
                  setSelectedDeck(null);
                }}>
                  Zamknij
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => {
                    addCard();
                    // Keep modal open for adding more cards
                  }} disabled={!newCard.front || !newCard.back}>
                    Dodaj i kontynuuj
                  </Button>
                  <Button onClick={() => {
                    addCard();
                    setShowAddCard(false);
                    setSelectedDeck(null);
                  }} disabled={!newCard.front || !newCard.back}>
                    Dodaj i zamknij
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
