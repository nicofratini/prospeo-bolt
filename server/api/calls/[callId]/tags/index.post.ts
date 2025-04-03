import { createError } from 'h3';
import { getServerSession } from '#auth';
import { z } from 'zod';
import supabase from '~/server/utils/supabase';
import type { Database } from '~/types/supabase';

type Tag = Database['public']['Tables']['tags']['Row'];

// Validation schema for tag assignment
const tagAssignmentSchema = z.object({
  tag_id: z.string().uuid('Invalid tag ID'),
});

export default defineEventHandler(async (event) => {
  try {
    // Get the current user session
    const session = await getServerSession(event);
    if (!session?.user?.id) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      });
    }

    // Get call ID from params
    const callId = event.context.params?.callId;
    if (!callId) {
      throw createError({
        statusCode: 400,
        message: 'Call ID is required',
      });
    }

    // Read and validate request body
    const body = await readBody(event);
    const { tag_id } = tagAssignmentSchema.parse(body);

    // Verify call ownership
    const { data: call, error: callError } = await supabase
      .from('call_history')
      .select('id')
      .eq('id', callId)
      .eq('user_id', session.user.id)
      .single();

    if (callError || !call) {
      throw createError({
        statusCode: 404,
        message: 'Call not found',
      });
    }

    // Verify tag ownership
    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .select('id')
      .eq('id', tag_id)
      .eq('user_id', session.user.id)
      .single();

    if (tagError || !tag) {
      throw createError({
        statusCode: 404,
        message: 'Tag not found',
      });
    }

    // Assign the tag to the call
    const { error: assignError } = await supabase
      .from('call_tags')
      .insert({
        call_id: callId,
        tag_id,
        user_id: session.user.id,
        assigned_at: new Date().toISOString(),
      });

    // Handle potential Supabase errors
    if (assignError) {
      console.error('Error assigning tag:', assignError);
      if (assignError.code === '23505') { // Unique constraint violation
        throw createError({
          statusCode: 409,
          message: 'Tag is already assigned to this call',
        });
      }
      throw createError({
        statusCode: 500,
        message: 'Failed to assign tag',
      });
    }

    // Fetch the assigned tag details
    const { data: assignedTag, error: fetchError } = await supabase
      .from('tags')
      .select('*')
      .eq('id', tag_id)
      .single();

    if (fetchError) {
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch assigned tag details',
      });
    }

    // Set response status to 201 Created
    setResponseStatus(event, 201);

    return assignedTag as Tag;
  }
  catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: error.errors.map(e => e.message).join(', '),
      });
    }

    // Re-throw if it's already an H3 error
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    console.error('Call Tags API error:', error);

    // Return a generic error for unexpected issues
    throw createError({
      statusCode: 500,
      message: 'An unexpected error occurred',
    });
  }
});