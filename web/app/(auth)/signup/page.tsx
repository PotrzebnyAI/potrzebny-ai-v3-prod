'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toaster';
import { Brain, Mail, Lock, User, Check } from 'lucide-react';

const signupSchema = z.object({
  firstName: z.string().min(2, 'Imię musi mieć co najmniej 2 znaki').optional(),
  lastName: z.string().min(2, 'Nazwisko musi mieć co najmniej 2 znaki').optional(),
  email: z.string().email('Nieprawidłowy format email'),
  password: z
    .string()
    .min(12, 'Hasło musi mieć co najmniej 12 znaków')
    .regex(/[a-z]/, 'Hasło musi zawierać małą literę')
    .regex(/[A-Z]/, 'Hasło musi zawierać wielką literę')
    .regex(/[0-9]/, 'Hasło musi zawierać cyfrę')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Hasło musi zawierać znak specjalny'),
  confirmPassword: z.string(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Musisz zaakceptować regulamin' }),
  }),
  acceptPrivacy: z.literal(true, {
    errorMap: () => ({ message: 'Musisz zaakceptować politykę prywatności' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Hasła nie są identyczne',
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      acceptTerms: false as unknown as true,
      acceptPrivacy: false as unknown as true,
    },
  });

  const password = watch('password', '');

  const passwordRequirements = [
    { label: 'Co najmniej 12 znaków', met: password.length >= 12 },
    { label: 'Mała litera', met: /[a-z]/.test(password) },
    { label: 'Wielka litera', met: /[A-Z]/.test(password) },
    { label: 'Cyfra', met: /[0-9]/.test(password) },
    { label: 'Znak specjalny', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Błąd rejestracji');
        return;
      }

      toast.success('Konto utworzone! Sprawdź email aby zweryfikować konto.');
      router.push('/login?registered=true');
    } catch {
      toast.error('Wystąpił błąd podczas rejestracji');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Potrzebny.AI</span>
          </Link>
          <CardTitle className="mt-6">Utwórz konto</CardTitle>
          <CardDescription>
            Rozpocznij darmowy 3-dniowy okres próbny
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Imię</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Jan"
                  leftIcon={<User className="h-4 w-4" />}
                  error={errors.firstName?.message}
                  {...register('firstName')}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nazwisko</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Kowalski"
                  error={errors.lastName?.message}
                  {...register('lastName')}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" required>Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="twoj@email.pl"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register('email')}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" required>Hasło</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                {...register('password')}
                disabled={isLoading}
              />
              {password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req) => (
                    <div
                      key={req.label}
                      className={`flex items-center gap-2 text-xs ${
                        req.met ? 'text-green-600' : 'text-muted-foreground'
                      }`}
                    >
                      <Check className={`h-3 w-3 ${req.met ? '' : 'opacity-30'}`} />
                      {req.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" required>Potwierdź hasło</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  className="mt-1"
                  {...register('acceptTerms')}
                  disabled={isLoading}
                />
                <Label htmlFor="acceptTerms" className="text-sm font-normal">
                  Akceptuję{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    regulamin
                  </Link>
                </Label>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
              )}

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="acceptPrivacy"
                  className="mt-1"
                  {...register('acceptPrivacy')}
                  disabled={isLoading}
                />
                <Label htmlFor="acceptPrivacy" className="text-sm font-normal">
                  Akceptuję{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    politykę prywatności
                  </Link>
                </Label>
              </div>
              {errors.acceptPrivacy && (
                <p className="text-sm text-destructive">{errors.acceptPrivacy.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" loading={isLoading}>
              Utwórz konto
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Masz już konto?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Zaloguj się
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
