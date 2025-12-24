'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';
import {
  CreditCard,
  Check,
  AlertCircle,
  Crown,
  Zap,
  ArrowRight,
  Download,
  Trash2,
} from 'lucide-react';

interface Subscription {
  id: string;
  planId: string;
  panelType: string;
  status: string;
  pricePln: number;
  billingCycle: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface PaymentMethod {
  id: string;
  type: string;
  brand: string;
  lastFour: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  pdfUrl: string;
}

const PLANS = [
  {
    id: 'educational_basic',
    name: 'Educational Basic',
    price: 29,
    features: ['Dostęp do kursów', 'Fiszki AI', 'Quizy', 'Śledzenie postępów'],
  },
  {
    id: 'educational_pro',
    name: 'Educational Pro',
    price: 49,
    features: ['Wszystko z Basic', 'Certyfikaty', 'Konsultacje', 'Priorytetowe wsparcie'],
    popular: true,
  },
  {
    id: 'educational_premium',
    name: 'Educational Premium',
    price: 79,
    features: ['Wszystko z Pro', 'Materiały premium', 'Mentoring', 'Dostęp VIP'],
  },
];

export default function BillingPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const [subsRes, methodsRes, invoicesRes] = await Promise.all([
        fetch('/api/payments/subscriptions'),
        fetch('/api/payments/methods'),
        fetch('/api/payments/invoices'),
      ]);

      const subsData = await subsRes.json();
      const methodsData = await methodsRes.json();
      const invoicesData = await invoicesRes.json();

      if (subsData.success) setSubscriptions(subsData.data || []);
      if (methodsData.success) setPaymentMethods(methodsData.data || []);
      if (invoicesData.success) setInvoices(invoicesData.data || []);
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      const response = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle: 'monthly' }),
      });

      const data = await response.json();

      if (data.success && data.data.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else {
        toast.error(data.error || 'Błąd tworzenia subskrypcji');
      }
    } catch (error) {
      toast.error('Błąd połączenia');
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Czy na pewno chcesz anulować subskrypcję?')) return;

    try {
      const response = await fetch('/api/payments/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Subskrypcja zostanie anulowana na koniec okresu rozliczeniowego');
        fetchBillingData();
      } else {
        toast.error(data.error || 'Błąd anulowania');
      }
    } catch (error) {
      toast.error('Błąd połączenia');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Aktywna</span>;
      case 'trialing':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Okres próbny</span>;
      case 'past_due':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Zaległość</span>;
      case 'canceled':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Anulowana</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-48 bg-muted rounded" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-64 bg-muted rounded" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Płatności i subskrypcje</h1>
        <p className="text-muted-foreground">Zarządzaj swoimi planami i metodami płatności</p>
      </div>

      {subscriptions.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Twoje subskrypcje</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {subscriptions.map((sub) => (
              <Card key={sub.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      {sub.planId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </CardTitle>
                    {getStatusBadge(sub.status)}
                  </div>
                  <CardDescription>{sub.panelType}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cena</span>
                      <span className="font-medium">{sub.pricePln / 100} PLN/{sub.billingCycle === 'monthly' ? 'mies.' : 'rok'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Następne rozliczenie</span>
                      <span>{new Date(sub.currentPeriodEnd).toLocaleDateString('pl-PL')}</span>
                    </div>
                    {sub.cancelAtPeriodEnd && (
                      <div className="flex items-center gap-2 text-orange-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        Zostanie anulowana na koniec okresu
                      </div>
                    )}
                  </div>
                  {!sub.cancelAtPeriodEnd && sub.status !== 'canceled' && (
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => handleCancelSubscription(sub.id)}
                    >
                      Anuluj subskrypcję
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-4">Dostępne plany</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => (
            <Card key={plan.id} className={plan.popular ? 'border-primary ring-2 ring-primary' : ''}>
              {plan.popular && (
                <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                  Najpopularniejszy
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground"> PLN/mies.</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  Wybierz plan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Metody płatności</h2>
        <Card>
          <CardContent className="pt-6">
            {paymentMethods.length > 0 ? (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <CreditCard className="h-8 w-8" />
                      <div>
                        <p className="font-medium">
                          {method.brand} **** {method.lastFour}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Wygasa {method.expMonth}/{method.expYear}
                        </p>
                      </div>
                      {method.isDefault && (
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">Domyślna</span>
                      )}
                    </div>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Brak zapisanych metod płatności</p>
              </div>
            )}
            <Button variant="outline" className="w-full mt-4">
              <CreditCard className="mr-2 h-4 w-4" />
              Dodaj metodę płatności
            </Button>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Historia faktur</h2>
        <Card>
          <CardContent className="pt-6">
            {invoices.length > 0 ? (
              <div className="space-y-2">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{invoice.amount / 100} PLN</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.createdAt).toLocaleDateString('pl-PL')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {invoice.status === 'paid' ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Opłacona</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Nieopłacona</span>
                      )}
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">Brak faktur</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
