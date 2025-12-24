import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createApiResponse, createErrorResponse } from '@/lib/api-response';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const createDeckSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.string().optional(),
});

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

    const decks = await db.query(
      `SELECT
        d.id,
        d.name,
        d.description,
        d.category,
        d.created_at as "createdAt",
        d.last_studied as "lastStudied",
        COUNT(c.id) as "cardsCount",
        COUNT(CASE WHEN c.next_review <= NOW() THEN 1 END) as "dueCount",
        COUNT(CASE WHEN c.interval >= 21 THEN 1 END) as "masteredCount"
      FROM flashcard_decks d
      LEFT JOIN flashcards c ON d.id = c.deck_id
      WHERE d.user_id = $1
      GROUP BY d.id
      ORDER BY d.updated_at DESC`,
      [session.user.id]
    );

    return createApiResponse(decks.rows.map(row => ({
      ...row,
      cardsCount: parseInt(row.cardsCount) || 0,
      dueCount: parseInt(row.dueCount) || 0,
      masteredCount: parseInt(row.masteredCount) || 0,
    })), traceId);
  } catch (error) {
    console.error('Error fetching decks:', error);
    return createErrorResponse('Internal server error', 500, traceId);
  }
}

export async function POST(request: NextRequest) {
  const traceId = crypto.randomUUID();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401, traceId);
    }

    const rateLimitResult = await rateLimit(session.user.id, 20, 60000);
    if (!rateLimitResult.success) {
      return createErrorResponse('Rate limit exceeded', 429, traceId);
    }

    const body = await request.json();
    const validationResult = createDeckSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(validationResult.error.errors[0].message, 400, traceId);
    }

    const { name, description, category } = validationResult.data;

    const result = await db.query(
      `INSERT INTO flashcard_decks (id, user_id, name, description, category, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING
         id,
         name,
         description,
         category,
         created_at as "createdAt"`,
      [crypto.randomUUID(), session.user.id, name, description || '', category || 'general']
    );

    return createApiResponse({
      ...result.rows[0],
      cardsCount: 0,
      dueCount: 0,
      masteredCount: 0,
      lastStudied: null,
    }, traceId);
  } catch (error) {
    console.error('Error creating deck:', error);
    return createErrorResponse('Internal server error', 500, traceId);
  }
}
