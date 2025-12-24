import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  Brain,
  Users,
  Shield,
  Award,
  TrendingUp,
  ArrowRight,
  Check
} from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Panel Edukacyjny',
    description: 'Kursy, fiszki AI i quizy z pełnym śledzeniem postępów.',
    price: 'od 29 PLN/mies.',
  },
  {
    icon: Users,
    title: 'Panel Wykładowcy',
    description: 'Twórz materiały edukacyjne i zarządzaj studentami.',
    price: 'od 29 PLN/mies.',
  },
  {
    icon: Shield,
    title: 'Panel Pacjenta',
    description: 'Szyfrowane notatki terapeutyczne zgodne z RODO.',
    price: 'od 49 PLN/mies.',
  },
  {
    icon: Brain,
    title: 'Super Mózg',
    description: 'Metryki kognitywne, optymalizacja snu i diety.',
    price: '79 PLN/mies.',
  },
  {
    icon: Award,
    title: 'Gamifikacja',
    description: 'System XP, odznaki, wyzwania i rankingi.',
    price: 'w każdym planie',
  },
  {
    icon: TrendingUp,
    title: 'Panel Lekarza',
    description: 'Dostęp do baz badań i narzędzia analizy.',
    price: 'od 79 PLN/mies.',
  },
];

const benefits = [
  'Darmowy 3-dniowy okres próbny',
  'Brak karty kredytowej na start',
  'Anuluj w dowolnym momencie',
  'Szyfrowanie AES-256-GCM',
  'Zgodność z RODO',
  'Wsparcie 24/7',
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Potrzebny.AI</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/pricing" className="text-sm font-medium hover:text-primary">
              Cennik
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary">
              O nas
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-primary">
              Kontakt
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Zaloguj się</Button>
            </Link>
            <Link href="/signup">
              <Button>Rozpocznij za darmo</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center py-24 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Twoja kompleksowa
            <span className="text-primary"> platforma edukacyjna</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Potrzebny.AI to platforma edukacyjna nowej generacji z AI.
            Kursy, fiszki, quizy, panel pacjenta, panel lekarza i wiele więcej.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Rozpocznij 3-dniowy trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Zobacz cennik
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {benefits.slice(0, 3).map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-green-500" />
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Wszystko czego potrzebujesz
          </h2>
          <p className="mt-4 text-muted-foreground">
            14 specjalistycznych paneli dopasowanych do Twoich potrzeb
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="relative overflow-hidden">
              <CardHeader>
                <feature.icon className="h-10 w-10 text-primary" />
                <CardTitle className="mt-4">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-primary">{feature.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/50 py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Dlaczego Potrzebny.AI?
            </h2>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary">
                  <Check className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-medium">{benefit}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">
            Gotowy aby zacząć?
          </h2>
          <p className="text-muted-foreground">
            Dołącz do tysięcy użytkowników i zacznij swoją przygodę z Potrzebny.AI
          </p>
          <Link href="/signup">
            <Button size="lg">
              Rozpocznij za darmo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-primary" />
                <span className="font-bold">Potrzebny.AI</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                Kompleksowa platforma edukacyjna z AI.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Produkt</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/pricing" className="hover:text-primary">Cennik</Link></li>
                <li><Link href="/features" className="hover:text-primary">Funkcje</Link></li>
                <li><Link href="/docs" className="hover:text-primary">Dokumentacja</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">Firma</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary">O nas</Link></li>
                <li><Link href="/contact" className="hover:text-primary">Kontakt</Link></li>
                <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">Prawne</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary">Polityka prywatności</Link></li>
                <li><Link href="/terms" className="hover:text-primary">Regulamin</Link></li>
                <li><Link href="/cookies" className="hover:text-primary">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Potrzebny.AI Sp. z o.o. Wszelkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
