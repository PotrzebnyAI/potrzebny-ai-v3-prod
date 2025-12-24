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

    // Get user's gamification data
    const gamificationResult = await db.query(
      `SELECT
        g.xp,
        g.level,
        g.streak_days as "streakDays",
        g.total_badges as "totalBadges",
        g.achievements,
        g.weekly_xp as "weeklyXp",
        g.monthly_xp as "monthlyXp",
        g.last_activity as "lastActivity"
      FROM gamification_data g
      WHERE g.user_id = $1`,
      [session.user.id]
    );

    if (gamificationResult.rows.length === 0) {
      // Create initial gamification data if not exists
      await db.query(
        `INSERT INTO gamification_data (id, user_id, xp, level, streak_days, total_badges, achievements, weekly_xp, monthly_xp, created_at, updated_at)
         VALUES ($1, $2, 0, 1, 0, 0, '[]', 0, 0, NOW(), NOW())`,
        [crypto.randomUUID(), session.user.id]
      );

      return createApiResponse({
        xp: 0,
        level: 1,
        streakDays: 0,
        totalBadges: 0,
        achievements: [],
        weeklyXp: 0,
        monthlyXp: 0,
        nextLevelXp: 100,
        rank: 0,
      }, traceId);
    }

    const data = gamificationResult.rows[0];

    // Calculate XP needed for next level (example formula)
    const nextLevelXp = Math.floor(100 * Math.pow(1.5, data.level - 1));

    // Get user's rank
    const rankResult = await db.query(
      `SELECT COUNT(*) + 1 as rank
       FROM gamification_data
       WHERE xp > $1`,
      [data.xp]
    );

    return createApiResponse({
      ...data,
      achievements: data.achievements || [],
      nextLevelXp,
      rank: parseInt(rankResult.rows[0]?.rank) || 1,
    }, traceId);
  } catch (error) {
    console.error('Error fetching gamification stats:', error);
    return createErrorResponse('Internal server error', 500, traceId);
  }
}
