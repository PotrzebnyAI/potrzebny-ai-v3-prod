import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createApiResponse, createErrorResponse } from '@/lib/api-response';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const createCourseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  category: z.string(),
  price: z.number().min(0).optional(),
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

    const courses = await db.query(
      `SELECT
        c.id,
        c.title,
        c.description,
        c.category,
        c.status,
        c.price_pln as "pricePln",
        c.created_at as "createdAt",
        c.updated_at as "updatedAt",
        COUNT(DISTINCT e.user_id) as "studentsCount",
        COUNT(DISTINCT l.id) as "lessonsCount",
        COALESCE(AVG(p.progress), 0) as "completionRate"
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN lessons l ON c.id = l.course_id
      LEFT JOIN user_progress p ON c.id = p.course_id
      WHERE c.instructor_id = $1
      GROUP BY c.id
      ORDER BY c.updated_at DESC`,
      [session.user.id]
    );

    return createApiResponse(courses.rows, traceId);
  } catch (error) {
    console.error('Error fetching courses:', error);
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
    const validationResult = createCourseSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(validationResult.error.errors[0].message, 400, traceId);
    }

    const { title, description, category, price } = validationResult.data;

    const result = await db.query(
      `INSERT INTO courses (id, instructor_id, title, description, category, price_pln, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'draft', NOW(), NOW())
       RETURNING
         id,
         title,
         description,
         category,
         status,
         price_pln as "pricePln",
         created_at as "createdAt",
         updated_at as "updatedAt"`,
      [crypto.randomUUID(), session.user.id, title, description || '', category, (price || 0) * 100]
    );

    return createApiResponse({
      ...result.rows[0],
      studentsCount: 0,
      lessonsCount: 0,
      completionRate: 0,
    }, traceId);
  } catch (error) {
    console.error('Error creating course:', error);
    return createErrorResponse('Internal server error', 500, traceId);
  }
}
