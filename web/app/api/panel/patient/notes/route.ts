import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/db';
import { createTherapyNoteSchema, updateTherapyNoteSchema, paginationSchema } from '@/lib/validation';
import { encrypt, decrypt } from '@/lib/encryption';
import { auditLog, AUDIT_ACTIONS } from '@/lib/audit';
import {
  success,
  created,
  unauthorized,
  notFound,
  forbidden,
  paginated,
  handleError,
  generateTraceId,
} from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const traceId = generateTraceId();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return unauthorized(traceId);
    }

    const { searchParams } = new URL(req.url);
    const pagination = paginationSchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      sortBy: searchParams.get('sortBy') || 'session_date',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    });

    const supabase = createServerSupabaseClient();

    // Count total
    const { count } = await supabase
      .from('therapy_notes')
      .select('*', { count: 'exact', head: true })
      .eq('patient_user_id', session.user.id)
      .eq('is_archived', false);

    // Get paginated notes
    const offset = (pagination.page - 1) * pagination.limit;
    const { data: notes, error } = await supabase
      .from('therapy_notes')
      .select('*')
      .eq('patient_user_id', session.user.id)
      .eq('is_archived', false)
      .order(pagination.sortBy || 'session_date', { ascending: pagination.sortOrder === 'asc' })
      .range(offset, offset + pagination.limit - 1);

    if (error) {
      throw error;
    }

    // Decrypt notes content
    const decryptedNotes = notes.map((note) => {
      try {
        const decryptedContent = decrypt({
          ciphertext: note.encrypted_content,
          iv: note.encryption_iv,
          tag: note.encryption_tag,
        });

        return {
          id: note.id,
          sessionDate: note.session_date,
          content: decryptedContent,
          moodRating: note.mood_rating,
          energyLevel: note.energy_level,
          anxietyLevel: note.anxiety_level,
          tags: note.tags,
          sessionType: note.session_type,
          durationMinutes: note.duration_minutes,
          isSharedWithTherapist: note.is_shared_with_therapist,
          createdAt: note.created_at,
          updatedAt: note.updated_at,
        };
      } catch {
        // If decryption fails, return note without content
        return {
          id: note.id,
          sessionDate: note.session_date,
          content: '[Decryption error]',
          moodRating: note.mood_rating,
          energyLevel: note.energy_level,
          anxietyLevel: note.anxiety_level,
          tags: note.tags,
          sessionType: note.session_type,
          durationMinutes: note.duration_minutes,
          isSharedWithTherapist: note.is_shared_with_therapist,
          createdAt: note.created_at,
          updatedAt: note.updated_at,
        };
      }
    });

    return paginated(decryptedNotes, {
      page: pagination.page,
      limit: pagination.limit,
      total: count || 0,
    }, traceId);
  } catch (error) {
    return handleError(error, traceId);
  }
}

export async function POST(req: NextRequest) {
  const traceId = generateTraceId();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return unauthorized(traceId);
    }

    const body = await req.json();
    const validation = createTherapyNoteSchema.safeParse(body);

    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(issue.message);
      });
      return success(null, 400, traceId);
    }

    const { content, sessionDate, moodRating, energyLevel, anxietyLevel, tags, sessionType, durationMinutes, isSharedWithTherapist } = validation.data;

    // Encrypt content
    const encrypted = encrypt(content);

    const supabase = createServerSupabaseClient();

    const { data: note, error } = await supabase
      .from('therapy_notes')
      .insert({
        patient_user_id: session.user.id,
        session_date: sessionDate,
        encrypted_content: encrypted.ciphertext,
        encryption_iv: encrypted.iv,
        encryption_tag: encrypted.tag,
        mood_rating: moodRating,
        energy_level: energyLevel,
        anxiety_level: anxietyLevel,
        tags: tags || [],
        session_type: sessionType,
        duration_minutes: durationMinutes,
        is_shared_with_therapist: isSharedWithTherapist,
      })
      .select('id, session_date, mood_rating, energy_level, anxiety_level, tags, session_type, duration_minutes, is_shared_with_therapist, created_at')
      .single();

    if (error) {
      throw error;
    }

    // Audit log (sensitive - GDPR)
    await auditLog({
      userId: session.user.id,
      action: AUDIT_ACTIONS.THERAPY_NOTE_CREATED,
      resourceType: 'therapy_note',
      resourceId: note.id,
      severity: 'info',
      metadata: { sessionDate, moodRating },
      req,
    });

    return created(
      {
        ...note,
        content, // Return decrypted content
      },
      traceId
    );
  } catch (error) {
    return handleError(error, traceId);
  }
}

export async function PUT(req: NextRequest) {
  const traceId = generateTraceId();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return unauthorized(traceId);
    }

    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get('id');

    if (!noteId) {
      return notFound('Note ID required', traceId);
    }

    const body = await req.json();
    const validation = updateTherapyNoteSchema.safeParse(body);

    if (!validation.success) {
      return handleError(validation.error, traceId);
    }

    const supabase = createServerSupabaseClient();

    // Check ownership
    const { data: existingNote } = await supabase
      .from('therapy_notes')
      .select('patient_user_id')
      .eq('id', noteId)
      .single();

    if (!existingNote || existingNote.patient_user_id !== session.user.id) {
      return forbidden(traceId);
    }

    const updateData: Record<string, unknown> = {};
    const { content, sessionDate, moodRating, energyLevel, anxietyLevel, tags, sessionType, durationMinutes, isSharedWithTherapist, isArchived } = validation.data;

    if (content !== undefined) {
      const encrypted = encrypt(content);
      updateData.encrypted_content = encrypted.ciphertext;
      updateData.encryption_iv = encrypted.iv;
      updateData.encryption_tag = encrypted.tag;
    }
    if (sessionDate !== undefined) updateData.session_date = sessionDate;
    if (moodRating !== undefined) updateData.mood_rating = moodRating;
    if (energyLevel !== undefined) updateData.energy_level = energyLevel;
    if (anxietyLevel !== undefined) updateData.anxiety_level = anxietyLevel;
    if (tags !== undefined) updateData.tags = tags;
    if (sessionType !== undefined) updateData.session_type = sessionType;
    if (durationMinutes !== undefined) updateData.duration_minutes = durationMinutes;
    if (isSharedWithTherapist !== undefined) updateData.is_shared_with_therapist = isSharedWithTherapist;
    if (isArchived !== undefined) updateData.is_archived = isArchived;

    const { data: note, error } = await supabase
      .from('therapy_notes')
      .update(updateData)
      .eq('id', noteId)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    // Audit log
    await auditLog({
      userId: session.user.id,
      action: AUDIT_ACTIONS.THERAPY_NOTE_UPDATED,
      resourceType: 'therapy_note',
      resourceId: noteId,
      newValues: { updated: true },
      req,
    });

    // Decrypt for response
    let decryptedContent = '';
    try {
      decryptedContent = decrypt({
        ciphertext: note.encrypted_content,
        iv: note.encryption_iv,
        tag: note.encryption_tag,
      });
    } catch {
      decryptedContent = '[Decryption error]';
    }

    return success({
      id: note.id,
      sessionDate: note.session_date,
      content: decryptedContent,
      moodRating: note.mood_rating,
      energyLevel: note.energy_level,
      anxietyLevel: note.anxiety_level,
      tags: note.tags,
      sessionType: note.session_type,
      durationMinutes: note.duration_minutes,
      isSharedWithTherapist: note.is_shared_with_therapist,
      isArchived: note.is_archived,
      updatedAt: note.updated_at,
    }, 200, traceId);
  } catch (error) {
    return handleError(error, traceId);
  }
}

export async function DELETE(req: NextRequest) {
  const traceId = generateTraceId();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return unauthorized(traceId);
    }

    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get('id');

    if (!noteId) {
      return notFound('Note ID required', traceId);
    }

    const supabase = createServerSupabaseClient();

    // Check ownership
    const { data: existingNote } = await supabase
      .from('therapy_notes')
      .select('patient_user_id')
      .eq('id', noteId)
      .single();

    if (!existingNote || existingNote.patient_user_id !== session.user.id) {
      return forbidden(traceId);
    }

    // Soft delete by archiving
    await supabase
      .from('therapy_notes')
      .update({ is_archived: true })
      .eq('id', noteId);

    // Audit log
    await auditLog({
      userId: session.user.id,
      action: AUDIT_ACTIONS.THERAPY_NOTE_DELETED,
      resourceType: 'therapy_note',
      resourceId: noteId,
      severity: 'warning',
      req,
    });

    return success({ message: 'Note deleted successfully' }, 200, traceId);
  } catch (error) {
    return handleError(error, traceId);
  }
}
