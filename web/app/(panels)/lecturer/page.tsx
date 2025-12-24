'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toaster';
import {
  BookOpen,
  Users,
  FileText,
  Video,
  Plus,
  Edit,
  Trash2,
  Eye,
  Upload,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  studentsCount: number;
  lessonsCount: number;
  completionRate: number;
  createdAt: string;
  updatedAt: string;
}

interface Lesson {
  id: string;
  courseId: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  duration: number;
  order: number;
  isPublished: boolean;
}

interface CourseStats {
  totalCourses: number;
  totalStudents: number;
  totalLessons: number;
  averageCompletion: number;
  totalRevenue: number;
}

export default function LecturerPanel() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: 'programming',
    price: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, statsRes] = await Promise.all([
        fetch('/api/panel/lecturer/courses'),
        fetch('/api/panel/lecturer/stats'),
      ]);

      const coursesData = await coursesRes.json();
      const statsData = await statsRes.json();

      if (coursesData.success) setCourses(coursesData.data || []);
      if (statsData.success) setStats(statsData.data);
    } catch (error) {
      console.error('Error fetching lecturer data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createCourse = async () => {
    try {
      const response = await fetch('/api/panel/lecturer/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Kurs został utworzony');
        setCourses([data.data, ...courses]);
        setShowCreateModal(false);
        setNewCourse({ title: '', description: '', category: 'programming', price: 0 });
      } else {
        toast.error(data.error || 'Błąd tworzenia kursu');
      }
    } catch (error) {
      toast.error('Błąd połączenia');
    }
  };

  const deleteCourse = async (courseId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten kurs?')) return;

    try {
      const response = await fetch(`/api/panel/lecturer/courses/${courseId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Kurs został usunięty');
        setCourses(courses.filter(c => c.id !== courseId));
      } else {
        toast.error(data.error || 'Błąd usuwania kursu');
      }
    } catch (error) {
      toast.error('Błąd połączenia');
    }
  };

  const publishCourse = async (courseId: string) => {
    try {
      const response = await fetch(`/api/panel/lecturer/courses/${courseId}/publish`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Kurs został opublikowany');
        setCourses(courses.map(c => c.id === courseId ? { ...c, status: 'published' } : c));
      } else {
        toast.error(data.error || 'Błąd publikacji kursu');
      }
    } catch (error) {
      toast.error('Błąd połączenia');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1"><CheckCircle className="h-3 w-3" />Opublikowany</span>;
      case 'draft':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs flex items-center gap-1"><Clock className="h-3 w-3" />Szkic</span>;
      case 'archived':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs flex items-center gap-1"><AlertCircle className="h-3 w-3" />Zarchiwizowany</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-muted rounded" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-muted rounded" />)}
        </div>
        <div className="h-96 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panel Wykładowcy</h1>
          <p className="text-muted-foreground">Zarządzaj swoimi kursami i materiałami edukacyjnymi</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nowy kurs
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Kursy</CardDescription>
              <CardTitle className="text-2xl">{stats.totalCourses}</CardTitle>
            </CardHeader>
            <CardContent>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Studenci</CardDescription>
              <CardTitle className="text-2xl">{stats.totalStudents}</CardTitle>
            </CardHeader>
            <CardContent>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Lekcje</CardDescription>
              <CardTitle className="text-2xl">{stats.totalLessons}</CardTitle>
            </CardHeader>
            <CardContent>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Średnie ukończenie</CardDescription>
              <CardTitle className="text-2xl">{stats.averageCompletion}%</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Przychód</CardDescription>
              <CardTitle className="text-2xl">{stats.totalRevenue} PLN</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-xs text-muted-foreground">Ten miesiąc</span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Courses List */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Twoje kursy</h2>
        {courses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                    </div>
                    {getStatusBadge(course.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{course.studentsCount} studentów</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{course.lessonsCount} lekcji</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Ukończenie</span>
                        <span>{course.completionRate}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${course.completionRate}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="mr-1 h-3 w-3" />
                        Edytuj
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                      {course.status === 'draft' && (
                        <Button size="sm" onClick={() => publishCourse(course.id)}>
                          Publikuj
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => deleteCourse(course.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Brak kursów</h3>
              <p className="text-muted-foreground text-center mb-4">
                Nie masz jeszcze żadnych kursów. Stwórz swój pierwszy kurs!
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Stwórz kurs
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Szybkie akcje</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowCreateModal(true)}>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <Plus className="h-8 w-8 text-primary mb-2" />
              <span className="font-medium">Nowy kurs</span>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <Video className="h-8 w-8 text-primary mb-2" />
              <span className="font-medium">Dodaj wideo</span>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <Upload className="h-8 w-8 text-primary mb-2" />
              <span className="font-medium">Upload materiałów</span>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <span className="font-medium">Statystyki</span>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Nowy kurs</CardTitle>
              <CardDescription>Utwórz nowy kurs edukacyjny</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tytuł kursu</Label>
                <Input
                  id="title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="np. Podstawy programowania w Python"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Opis</Label>
                <textarea
                  id="description"
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="Opisz, czego nauczy się student..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Kategoria</Label>
                  <select
                    id="category"
                    className="w-full px-3 py-2 border rounded-md"
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                  >
                    <option value="programming">Programowanie</option>
                    <option value="design">Design</option>
                    <option value="business">Biznes</option>
                    <option value="marketing">Marketing</option>
                    <option value="health">Zdrowie</option>
                    <option value="psychology">Psychologia</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Cena (PLN)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newCourse.price}
                    onChange={(e) => setNewCourse({ ...newCourse, price: parseInt(e.target.value) || 0 })}
                    placeholder="0 = darmowy"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Anuluj
                </Button>
                <Button onClick={createCourse} disabled={!newCourse.title}>
                  Utwórz kurs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
