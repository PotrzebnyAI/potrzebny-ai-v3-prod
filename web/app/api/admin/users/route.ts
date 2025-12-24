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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const role = searchParams.get('role');

    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (u.email ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND u.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (role) {
      whereClause += ` AND u.role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    const users = await db.query(
      `SELECT
        u.id,
        u.email,
        u.name,
        u.role,
        u.status,
        u.created_at as "createdAt",
        u.last_login as "lastLogin",
        s.plan_id as subscription
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
      WHERE ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    const countResult = await db.query(
      `SELECT COUNT(*) FROM users u WHERE ${whereClause}`,
      params
    );

    return createApiResponse({
      data: users.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      },
    }, traceId);
  } catch (error) {
    console.error('Error fetching users:', error);
    return createErrorResponse('Internal server error', 500, traceId);
  }
}
