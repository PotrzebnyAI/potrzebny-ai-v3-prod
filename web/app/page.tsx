'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Brain,
  BookOpen,
  Shield,
  Users,
  Trophy,
  Zap,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  Sparkles,
  Heart,
  GraduationCap,
  Stethoscope,
  UserCheck,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Super Mózg',
    description: 'Techniki pamięciowe oparte na nauce, fiszki z algorytmem SM-2 i ćwiczenia kognitywne.',
  },
  {
    icon: BookOpen,
    title: 'Kursy Premium',
    description: 'Setki kursów od najlepszych wykładowców z certyfikatami ukończenia.',
  },
  {
    icon: Shield,
    title: 'Szyfrowanie AES-256',
    description: 'Twoje dane są chronione najnowszymi standardami szyfrowania zgodnie z RODO.',
  },
  {
    icon: Users,
    title: 'Panel Rodzica',
    description: 'Monitoruj postępy nauki swoich dzieci i ustaw limity czasowe.',
  },
  {
    icon: Trophy,
    title: 'Gamifikacja',
    description: 'Zdobywaj XP, odznaki i rywalizuj z innymi użytkownikami na tablicy wyników.',
  },
  {
    icon: Heart,
    title: 'Wsparcie Terapeutyczne',
    description: 'Szyfrowane notatki terapeutyczne zgodne z RODO Art. 9 dla specjalistów.',
  },
];

const plans = [
  {
    name: 'Edukacyjny Pro',
    price: 59,
    popular: true,
    features: [
      'Dostęp do wszystkich kursów',
      'Super Mózg - techniki pamięciowe',
      'Fiszki i Quizy bez limitu',
      'Certyfikaty ukończenia',
      'Aplikacja mobilna',
      '3 dni za darmo',
    ],
  },
  {
    name: 'Pacjent Pro',
    price: 79,
    features: [
      'Szyfrowane notatki',
      'Śledzenie nastroju',
      'Połączenie z terapeutą',
      'Konsultacje wideo',
      'Wsparcie 24/7',
      '3 dni za darmo',
    ],
  },
  {
    name: 'Lekarz Pro',
    price: 299,
    features: [
      'Zarządzanie pacjentami',
      'Szyfrowane karty',
      'Konsultacje wideo',
      'E-recepty',
      'Analizy AI',
      '3 dni za darmo',
    ],
  },
];

const testimonials = [
  {
    name: 'Anna Kowalska',
    role: 'Studentka medycyny',
    content: 'Dzięki technikom Super Mózg zdałam wszystkie egzaminy z najlepszymi wynikami!',
    avatar: '👩‍🎓',
  },
  {
    name: 'Dr Jan Nowak',
    role: 'Psychiatra',
    content: 'Platforma idealna do prowadzenia dokumentacji pacjentów. Pełna zgodność z RODO.',
    avatar: '👨‍⚕️',
  },
  {
    name: 'Marta Wiśniewska',
    role: 'Mama dwójki dzieci',
    content: 'Moje dzieci uczą się z przyjemnością, a ja mam pełną kontrolę nad ich postępami.',
    avatar: '👩‍👧‍👦',
  },
];

const stats = [
  { value: '50,000+', label: 'Aktywnych użytkowników' },
  { value: '500+', label: 'Kursów' },
  { value: '98%', label: 'Zadowolonych klientów' },
  { value: '24/7', label: 'Wsparcie' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">Potrzebny.AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition">
              Funkcje
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary transition">
              Cennik
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-primary transition">
              Opinie
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Zaloguj się</Button>
            </Link>
            <Link href="/signup">
              <Button>
                Rozpocznij za darmo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">3 dni za darmo • Automatyczne odnowienie</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Platforma edukacyjna
          <br />
          <span className="text-primary">nowej generacji</span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Ucz się efektywniej z technikami Super Mózg, śledź postępy i osiągaj swoje cele.
          Dla studentów, lekarzy, terapeutów i rodziców.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8">
              <Play className="mr-2 h-5 w-5" />
              Wypróbuj 3 dni za darmo
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Zobacz funkcje
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Wszystko, czego potrzebujesz do nauki</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Kompletna platforma edukacyjna z narzędziami dla każdego użytkownika
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="border-2 hover:border-primary/50 transition">
              <CardHeader>
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Panels Overview */}
      <section className="bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">14 specjalistycznych paneli</h2>
            <p className="text-muted-foreground">Każdy użytkownik znajdzie narzędzia dopasowane do swoich potrzeb</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: GraduationCap, name: 'Panel Edukacyjny', desc: 'Kursy i materiały' },
              { icon: BookOpen, name: 'Panel Wykładowcy', desc: 'Twórz i sprzedawaj kursy' },
              { icon: Brain, name: 'Super Mózg', desc: 'Techniki pamięciowe' },
              { icon: Heart, name: 'Panel Pacjenta', desc: 'Notatki terapeutyczne' },
              { icon: Stethoscope, name: 'Panel Lekarza', desc: 'Zarządzanie pacjentami' },
              { icon: UserCheck, name: 'Panel Terapeuty', desc: 'Sesje i dokumentacja' },
              { icon: Users, name: 'Panel Rodzica', desc: 'Monitoring dzieci' },
              { icon: Trophy, name: 'Gamifikacja', desc: 'XP i odznaki' },
            ].map((panel) => (
              <Card key={panel.name} className="text-center hover:shadow-lg transition">
                <CardContent className="pt-6">
                  <panel.icon className="h-12 w-12 mx-auto text-primary mb-4" />
                  <h3 className="font-semibold mb-1">{panel.name}</h3>
                  <p className="text-sm text-muted-foreground">{panel.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Prosty i przejrzysty cennik</h2>
          <p className="text-muted-foreground">
            Wszystkie plany z <span className="text-primary font-semibold">3-dniowym bezpłatnym okresem próbnym</span>
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Najpopularniejszy
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground"> PLN/mies.</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                    Rozpocznij za darmo
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Po zakończeniu okresu próbnego subskrypcja odnawia się automatycznie.
          Możesz anulować w dowolnym momencie.
        </p>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Co mówią nasi użytkownicy</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{testimonial.avatar}</span>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="text-center py-16">
            <h2 className="text-3xl font-bold mb-4">Gotowy, aby zacząć?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Dołącz do tysięcy użytkowników, którzy już korzystają z Potrzebny.AI.
              Pierwsze 3 dni całkowicie za darmo!
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Załóż konto za darmo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Brain className="h-6 w-6 text-primary" />
                <span className="font-bold">Potrzebny.AI</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Platforma edukacyjna nowej generacji dla Polski.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produkt</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground">Funkcje</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground">Cennik</Link></li>
                <li><Link href="/faq" className="hover:text-foreground">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Firma</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">O nas</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Kontakt</Link></li>
                <li><Link href="/careers" className="hover:text-foreground">Kariera</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Prawne</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground">Polityka prywatności</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Regulamin</Link></li>
                <li><Link href="/gdpr" className="hover:text-foreground">RODO</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Potrzebny.AI. Wszelkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
