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

    const rateLimitResult = await rateLimit(session.user.id, 100, 60000);
    if (!rateLimitResult.success) {
      return createErrorResponse('Rate limit exceeded', 429, traceId);
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'weekly'; // weekly, monthly, all_time
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    let xpColumn = 'g.xp';
    if (period === 'weekly') {
      xpColumn = 'g.weekly_xp';
    } else if (period === 'monthly') {
      xpColumn = 'g.monthly_xp';
    }

    const leaderboard = await db.query(
      `SELECT
        ROW_NUMBER() OVER (ORDER BY ${xpColumn} DESC) as rank,
        u.id,
        u.name,
        p.avatar_url as "avatarUrl",
        g.level,
        ${xpColumn} as xp,
        g.streak_days as "streakDays",
        g.total_badges as "totalBadges"
      FROM gamification_data g
      JOIN users u ON g.user_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE ${xpColumn} > 0
      ORDER BY ${xpColumn} DESC
      LIMIT $1`,
      [limit]
    );

    // Get current user's rank
    const userRankResult = await db.query(
      `SELECT
        (SELECT COUNT(*) + 1 FROM gamification_data WHERE ${xpColumn} > (SELECT ${xpColumn} FROM gamification_data WHERE user_id = $1)) as rank,
        ${xpColumn} as xp,
        level,
        streak_days as "streakDays"
      FROM gamification_data
      WHERE user_id = $1`,
      [session.user.id]
    );

    return createApiResponse({
      leaderboard: leaderboard.rows.map(row => ({
        ...row,
        rank: parseInt(row.rank),
        xp: parseInt(row.xp) || 0,
        isCurrentUser: row.id === session.user.id,
      })),
      currentUser: userRankResult.rows[0] ? {
        rank: parseInt(userRankResult.rows[0].rank),
        xp: parseInt(userRankResult.rows[0].xp) || 0,
        level: userRankResult.rows[0].level,
        streakDays: userRankResult.rows[0].streakDays,
      } : null,
      period,
    }, traceId);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return createErrorResponse('Internal server error', 500, traceId);
  }
}
