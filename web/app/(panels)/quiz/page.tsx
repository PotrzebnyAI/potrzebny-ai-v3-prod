'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toaster';
import {
  HelpCircle,
  Plus,
  Play,
  Clock,
  Trophy,
  Target,
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Share2,
  BarChart3,
  Users,
  Star,
  Zap,
  Award,
} from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  questionsCount: number;
  timeLimit: number | null;
  difficulty: 'easy' | 'medium' | 'hard';
  attempts: number;
  bestScore: number | null;
  averageScore: number;
  createdAt: string;
  isPublic: boolean;
}

interface Question {
  id: string;
  quizId: string;
  text: string;
  type: 'single' | 'multiple' | 'true_false' | 'open';
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
  points: number;
}

interface QuizAttempt {
  quizId: string;
  questions: Question[];
  currentIndex: number;
  answers: { questionId: string; selectedOptions: string[]; isCorrect: boolean }[];
  startTime: number;
  timeLimit: number | null;
}

interface QuizResult {
  score: number;
  maxScore: number;
  percentage: number;
  timeTaken: number;
  correctAnswers: number;
  totalQuestions: number;
}

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    category: 'general',
    timeLimit: 0,
    difficulty: 'medium',
    isPublic: false,
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (currentAttempt?.timeLimit && timeRemaining !== null) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            finishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentAttempt?.timeLimit, timeRemaining]);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/api/panel/quiz/list');
      const data = await response.json();
      if (data.success) {
        setQuizzes(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createQuiz = async () => {
    try {
      const response = await fetch('/api/panel/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuiz),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Quiz został utworzony');
        setQuizzes([data.data, ...quizzes]);
        setShowCreateQuiz(false);
        setNewQuiz({
          title: '',
          description: '',
          category: 'general',
          timeLimit: 0,
          difficulty: 'medium',
          isPublic: false,
        });
      } else {
        toast.error(data.error || 'Błąd tworzenia quizu');
      }
    } catch (error) {
      toast.error('Błąd połączenia');
    }
  };

  const startQuiz = async (quizId: string) => {
    try {
      const response = await fetch(`/api/panel/quiz/${quizId}/start`);
      const data = await response.json();

      if (data.success) {
        const quiz = quizzes.find(q => q.id === quizId);
        setCurrentAttempt({
          quizId,
          questions: data.data,
          currentIndex: 0,
          answers: [],
          startTime: Date.now(),
          timeLimit: quiz?.timeLimit || null,
        });
        setSelectedOptions([]);
        setShowResult(false);
        setQuizResult(null);
        if (quiz?.timeLimit) {
          setTimeRemaining(quiz.timeLimit * 60);
        }
      } else {
        toast.error(data.error || 'Błąd rozpoczynania quizu');
      }
    } catch (error) {
      toast.error('Błąd połączenia');
    }
  };

  const submitAnswer = () => {
    if (!currentAttempt) return;

    const currentQuestion = currentAttempt.questions[currentAttempt.currentIndex];
    const isCorrect = selectedOptions.every(opt =>
      currentQuestion.options.find(o => o.id === opt)?.isCorrect
    ) && selectedOptions.length === currentQuestion.options.filter(o => o.isCorrect).length;

    const newAnswers = [
      ...currentAttempt.answers,
      {
        questionId: currentQuestion.id,
        selectedOptions,
        isCorrect,
      },
    ];

    if (currentAttempt.currentIndex < currentAttempt.questions.length - 1) {
      setCurrentAttempt({
        ...currentAttempt,
        currentIndex: currentAttempt.currentIndex + 1,
        answers: newAnswers,
      });
      setSelectedOptions([]);
    } else {
      // Quiz complete
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = async (answers = currentAttempt?.answers) => {
    if (!currentAttempt || !answers) return;

    const timeTaken = Math.floor((Date.now() - currentAttempt.startTime) / 1000);
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const totalQuestions = currentAttempt.questions.length;
    const maxScore = currentAttempt.questions.reduce((acc, q) => acc + q.points, 0);
    const score = answers.reduce((acc, a, i) =>
      a.isCorrect ? acc + currentAttempt.questions[i].points : acc, 0
    );
    const percentage = Math.round((score / maxScore) * 100);

    setQuizResult({
      score,
      maxScore,
      percentage,
      timeTaken,
      correctAnswers,
      totalQuestions,
    });
    setShowResult(true);

    // Save result to server
    try {
      await fetch(`/api/panel/quiz/${currentAttempt.quizId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          score,
          timeTaken,
        }),
      });
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  };

  const toggleOption = (optionId: string) => {
    if (!currentAttempt) return;

    const currentQuestion = currentAttempt.questions[currentAttempt.currentIndex];

    if (currentQuestion.type === 'single' || currentQuestion.type === 'true_false') {
      setSelectedOptions([optionId]);
    } else {
      setSelectedOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  // Quiz Result Screen
  if (showResult && quizResult) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
              quizResult.percentage >= 80 ? 'bg-green-100' :
              quizResult.percentage >= 60 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              {quizResult.percentage >= 80 ? (
                <Trophy className="h-10 w-10 text-green-600" />
              ) : quizResult.percentage >= 60 ? (
                <Star className="h-10 w-10 text-yellow-600" />
              ) : (
                <Target className="h-10 w-10 text-red-600" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {quizResult.percentage >= 80 ? 'Świetny wynik!' :
               quizResult.percentage >= 60 ? 'Dobra robota!' : 'Spróbuj ponownie!'}
            </CardTitle>
            <CardDescription>Quiz ukończony</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-primary">{quizResult.percentage}%</p>
              <p className="text-muted-foreground">{quizResult.score}/{quizResult.maxScore} punktów</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-green-600">{quizResult.correctAnswers}</p>
                <p className="text-sm text-muted-foreground">Poprawne</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-red-600">{quizResult.totalQuestions - quizResult.correctAnswers}</p>
                <p className="text-sm text-muted-foreground">Błędne</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Czas: {formatTime(quizResult.timeTaken)}</span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setCurrentAttempt(null);
                  setShowResult(false);
                  setQuizResult(null);
                }}
              >
                Wróć do listy
              </Button>
              <Button
                className="flex-1"
                onClick={() => currentAttempt && startQuiz(currentAttempt.quizId)}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Spróbuj ponownie
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active Quiz Screen
  if (currentAttempt && !showResult) {
    const currentQuestion = currentAttempt.questions[currentAttempt.currentIndex];
    const progress = ((currentAttempt.currentIndex + 1) / currentAttempt.questions.length) * 100;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        {/* Header */}
        <div className="w-full max-w-2xl mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-muted-foreground">
              Pytanie {currentAttempt.currentIndex + 1} z {currentAttempt.questions.length}
            </span>
            {timeRemaining !== null && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                timeRemaining < 60 ? 'bg-red-100 text-red-700' : 'bg-muted'
              }`}>
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(currentQuestion.type === 'single' ? 'medium' : 'hard')}`}>
                {currentQuestion.points} pkt
              </span>
              <span className="text-xs text-muted-foreground">
                {currentQuestion.type === 'single' ? 'Pojedynczy wybór' :
                 currentQuestion.type === 'multiple' ? 'Wielokrotny wybór' :
                 currentQuestion.type === 'true_false' ? 'Prawda/Fałsz' : 'Odpowiedź otwarta'}
              </span>
            </div>
            <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => toggleOption(option.id)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    selectedOptions.includes(option.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-muted-foreground/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedOptions.includes(option.id)
                        ? 'border-primary bg-primary text-white'
                        : 'border-muted-foreground/30'
                    }`}>
                      {selectedOptions.includes(option.id) && <CheckCircle className="h-4 w-4" />}
                    </div>
                    <span>{option.text}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentAttempt(null);
                  setTimeRemaining(null);
                }}
              >
                Anuluj quiz
              </Button>
              <Button
                onClick={submitAnswer}
                disabled={selectedOptions.length === 0}
              >
                {currentAttempt.currentIndex < currentAttempt.questions.length - 1 ? (
                  <>
                    Następne pytanie
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  'Zakończ quiz'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz List Screen
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
            <HelpCircle className="h-8 w-8 text-purple-500" />
            Quizy
          </h1>
          <p className="text-muted-foreground">Sprawdź swoją wiedzę i rywalizuj z innymi</p>
        </div>
        <Button onClick={() => setShowCreateQuiz(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Stwórz quiz
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Dostępne quizy</CardDescription>
            <CardTitle className="text-2xl">{quizzes.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ukończone</CardDescription>
            <CardTitle className="text-2xl">{quizzes.filter(q => q.attempts > 0).length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Najlepszy wynik</CardDescription>
            <CardTitle className="text-2xl">
              {Math.max(...quizzes.map(q => q.bestScore || 0), 0)}%
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Średni wynik</CardDescription>
            <CardTitle className="text-2xl">
              {Math.round(quizzes.reduce((acc, q) => acc + q.averageScore, 0) / (quizzes.length || 1))}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Quiz Grid */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Dostępne quizy</h2>
        {quizzes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(quiz.difficulty)}`}>
                      {quiz.difficulty === 'easy' ? 'Łatwy' :
                       quiz.difficulty === 'hard' ? 'Trudny' : 'Średni'}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <p className="font-medium">{quiz.questionsCount}</p>
                        <p className="text-muted-foreground">Pytań</p>
                      </div>
                      <div>
                        <p className="font-medium">{quiz.timeLimit ? `${quiz.timeLimit} min` : '∞'}</p>
                        <p className="text-muted-foreground">Czas</p>
                      </div>
                      <div>
                        <p className="font-medium">{quiz.attempts}</p>
                        <p className="text-muted-foreground">Prób</p>
                      </div>
                    </div>

                    {quiz.bestScore !== null && (
                      <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm text-muted-foreground">Najlepszy wynik</span>
                        <span className="font-bold text-primary">{quiz.bestScore}%</span>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      onClick={() => startQuiz(quiz.id)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {quiz.attempts > 0 ? 'Zagraj ponownie' : 'Rozpocznij quiz'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Create Quiz Card */}
            <Card
              className="border-dashed hover:border-primary cursor-pointer transition-colors"
              onClick={() => setShowCreateQuiz(true)}
            >
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[280px]">
                <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium">Stwórz własny quiz</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Utwórz quiz i udostępnij innym
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <HelpCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Brak quizów</h3>
              <p className="text-muted-foreground text-center mb-6">
                Stwórz swój pierwszy quiz lub poczekaj na quizy od innych użytkowników
              </p>
              <Button onClick={() => setShowCreateQuiz(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Stwórz quiz
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Create Quiz Modal */}
      {showCreateQuiz && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Nowy quiz</CardTitle>
              <CardDescription>Utwórz nowy quiz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tytuł quizu</Label>
                <Input
                  id="title"
                  value={newQuiz.title}
                  onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                  placeholder="np. Historia Polski - XX wiek"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Opis</Label>
                <textarea
                  id="description"
                  className="w-full min-h-[80px] px-3 py-2 border rounded-md"
                  value={newQuiz.description}
                  onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                  placeholder="Krótki opis quizu..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Kategoria</Label>
                  <select
                    id="category"
                    className="w-full px-3 py-2 border rounded-md"
                    value={newQuiz.category}
                    onChange={(e) => setNewQuiz({ ...newQuiz, category: e.target.value })}
                  >
                    <option value="general">Ogólne</option>
                    <option value="history">Historia</option>
                    <option value="science">Nauka</option>
                    <option value="languages">Języki</option>
                    <option value="geography">Geografia</option>
                    <option value="math">Matematyka</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Trudność</Label>
                  <select
                    id="difficulty"
                    className="w-full px-3 py-2 border rounded-md"
                    value={newQuiz.difficulty}
                    onChange={(e) => setNewQuiz({ ...newQuiz, difficulty: e.target.value })}
                  >
                    <option value="easy">Łatwy</option>
                    <option value="medium">Średni</option>
                    <option value="hard">Trudny</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Limit czasu (minuty, 0 = bez limitu)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min="0"
                  value={newQuiz.timeLimit}
                  onChange={(e) => setNewQuiz({ ...newQuiz, timeLimit: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newQuiz.isPublic}
                  onChange={(e) => setNewQuiz({ ...newQuiz, isPublic: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="isPublic" className="text-sm">Udostępnij publicznie</Label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateQuiz(false)}>
                  Anuluj
                </Button>
                <Button onClick={createQuiz} disabled={!newQuiz.title}>
                  Utwórz quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
