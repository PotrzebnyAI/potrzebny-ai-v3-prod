import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createApiResponse, createErrorResponse } from '@/lib/api-response';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const traceId = crypto.randomUUID();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401, traceId);
    }

    // Check if user is admin
    const userResult = await db.query(
      'SELECT role FROM users WHERE id = $1',
      [session.user.id]
    );

    if (userResult.rows[0]?.role !== 'admin') {
      return createErrorResponse('Forbidden', 403, traceId);
    }

    const rateLimitResult = await rateLimit(session.user.id, 100, 60000);
    if (!rateLimitResult.success) {
      return createErrorResponse('Rate limit exceeded', 429, traceId);
    }

    // Get various statistics
    const [
      usersStats,
      subscriptionStats,
      revenueStats,
      systemHealth,
    ] = await Promise.all([
      // User statistics
      db.query(`
        SELECT
          COUNT(*) as "totalUsers",
          COUNT(CASE WHEN last_login >= NOW() - INTERVAL '30 days' THEN 1 END) as "activeUsers",
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '1 day' THEN 1 END) as "newUsersToday",
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as "newUsersWeek"
        FROM users
      `),

      // Subscription statistics
      db.query(`
        SELECT
          COUNT(CASE WHEN status = 'active' THEN 1 END) as "activeSubscriptions",
          COUNT(CASE WHEN status = 'canceled' AND canceled_at >= NOW() - INTERVAL '30 days' THEN 1 END) as "canceledThisMonth"
        FROM subscriptions
      `),

      // Revenue statistics
      db.query(`
        SELECT
          COALESCE(SUM(amount_pln), 0) as "totalRevenue",
          COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('month', NOW()) THEN amount_pln END), 0) as "revenueThisMonth"
        FROM transactions
        WHERE status = 'completed'
      `),

      // System health (mock data for demonstration)
      Promise.resolve({
        rows: [{
          systemHealth: 'healthy',
          apiLatency: 45,
          errorRate: 0.02,
          dbConnections: 23,
        }]
      }),
    ]);

    const users = usersStats.rows[0];
    const subscriptions = subscriptionStats.rows[0];
    const revenue = revenueStats.rows[0];
    const health = systemHealth.rows[0];

    // Calculate churn rate
    const churnRate = subscriptions.activeSubscriptions > 0
      ? ((parseInt(subscriptions.canceledThisMonth) / parseInt(subscriptions.activeSubscriptions)) * 100).toFixed(2)
      : 0;

    return createApiResponse({
      totalUsers: parseInt(users.totalUsers) || 0,
      activeUsers: parseInt(users.activeUsers) || 0,
      newUsersToday: parseInt(users.newUsersToday) || 0,
      newUsersWeek: parseInt(users.newUsersWeek) || 0,
      totalRevenue: parseInt(revenue.totalRevenue) / 100 || 0,
      revenueThisMonth: parseInt(revenue.revenueThisMonth) / 100 || 0,
      activeSubscriptions: parseInt(subscriptions.activeSubscriptions) || 0,
      churnRate: parseFloat(churnRate as string),
      systemHealth: health.systemHealth,
      apiLatency: health.apiLatency,
      errorRate: health.errorRate,
      dbConnections: health.dbConnections,
    }, traceId);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return createErrorResponse('Internal server error', 500, traceId);
  }
}
