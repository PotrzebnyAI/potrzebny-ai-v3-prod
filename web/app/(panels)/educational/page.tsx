import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  BookOpen,
  GraduationCap,
  Clock,
  Trophy,
  Play,
  FileText,
  Brain,
  CheckCircle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EducationalPanelPage() {
  const session = await getServerSession(authOptions);
  const supabase = createServerSupabaseClient();

  const { data: courses } = await supabase
    .from('educational_content')
    .select('*')
    .eq('content_type', 'course')
    .eq('is_published', true)
    .eq('panel_type', 'educational')
    .order('view_count', { ascending: false })
    .limit(6);

  const { data: progress } = await supabase
    .from('user_content_progress')
    .select('*, educational_content(*)')
    .eq('user_id', session?.user?.id)
    .order('last_accessed_at', { ascending: false })
    .limit(4);

  const stats = [
    { label: 'Ukonczone kursy', value: progress?.filter(p => p.completed_at).length || 0, icon: CheckCircle },
    { label: 'W trakcie', value: progress?.filter(p => !p.completed_at).length || 0, icon: Clock },
    { label: 'Czas nauki', value: `${Math.floor((progress?.reduce((acc, p) => acc + (p.time_spent_seconds || 0), 0) || 0) / 60)} min`, icon: Clock },
    { label: 'Certyfikaty', value: 0, icon: Trophy },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panel Edukacyjny</h1>
          <p className="text-muted-foreground">Kursy, fiszki i quizy dopasowane do Ciebie</p>
        </div>
        <div className="flex gap-2">
          <Link href="/panels/educational/flashcards">
            <Button variant="outline"><Brain className="mr-2 h-4 w-4" />Fiszki</Button>
          </Link>
          <Link href="/panels/educational/quizzes">
            <Button variant="outline"><FileText className="mr-2 h-4 w-4" />Quizy</Button>
          </Link>
        </div>
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

      {progress && progress.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Kontynuuj naukę</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {progress.map((item) => (
              <Card key={item.id} className="flex">
                <div className="flex-1 p-4">
                  <h3 className="font-medium">{item.educational_content?.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.educational_content?.description?.substring(0, 100)}...
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex-1">
                      <div className="h-2 bg-muted rounded-full">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${item.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium">{item.progress_percentage}%</span>
                  </div>
                </div>
                <div className="flex items-center p-4">
                  <Link href={`/panels/educational/courses/${item.content_id}`}>
                    <Button size="icon"><Play className="h-4 w-4" /></Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Popularne kursy</h2>
          <Link href="/panels/educational/courses">
            <Button variant="ghost">Zobacz wszystkie</Button>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses?.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <GraduationCap className="h-12 w-12 text-muted-foreground" />
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.estimated_duration_minutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {course.view_count} wyświetleń
                  </span>
                </div>
                <Link href={`/panels/educational/courses/${course.id}`}>
                  <Button className="w-full mt-4">Rozpocznij</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
