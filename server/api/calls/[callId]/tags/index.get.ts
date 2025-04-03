import { createError } from 'h3';
import { getServerSession } from '#auth';
import supabase from '~/server/utils/supabase';
import type { Database } from '~/types/supabase';

type Tag = Database['public']['Tables']['tags']['Row'];

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

    // First, verify call ownership
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

    // Fetch tags associated with the call
    const { data: callTags, error: tagsError } = await supabase
      .from('call_tags')
      .select(`
        tag:tags!inner (
          id,
          name,
          color
        )
      `)
      .eq('call_id', callId)
      .eq('user_id', session.user.id);

    // Handle potential Supabase errors
    if (tagsError) {
      console.error('Error fetching call tags:', tagsError);
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch call tags',
      });
    }

    // Transform the response to get the tags array
    const tags = callTags.map(({ tag }) => tag) as Tag[];

    return tags;
  }
  catch (error) {
    // Log unexpected errors
    console.error('Call Tags API error:', error);

    // Re-throw if it's already an H3 error
    if (error.statusCode) {
      throw error;
    }

    // Return a generic error for unexpected issues
    throw createError({
      statusCode: 500,
      message: 'An unexpected error occurred',
    });
  }
});