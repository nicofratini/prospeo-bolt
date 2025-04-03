import { createError } from 'h3';
import { getServerSession } from '#auth';
import supabase from '~/server/utils/supabase';
import type { Database } from '~/types/supabase';

type CallHistory = Database['public']['Tables']['call_history']['Row'];

interface CallWithRelations extends CallHistory {
  property: {
    id: string;
    name: string;
    address: string;
  } | null;
  ai_agent: {
    id: string;
    agent_name: string;
  } | null;
}

export default defineEventHandler(async (event): Promise<CallWithRelations> => {
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
    const callId = event.context.params?.id;
    if (!callId) {
      throw createError({
        statusCode: 400,
        message: 'Call ID is required',
      });
    }

    // Fetch call details with related data
    const { data: call, error } = await supabase
      .from('call_history')
      .select(`
        *,
        transcript,
        property:properties(
          id,
          name,
          address
        ),
        ai_agent:ai_agents(
          id,
          agent_name
        )
      `)
      .eq('id', callId)
      .eq('user_id', session.user.id)
      .single();

    // Handle potential Supabase errors
    if (error) {
      console.error('Error fetching call details:', error);
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          message: 'Call not found',
        });
      }
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch call details',
      });
    }

    // Return the call details with relations
    return call as CallWithRelations;
  }
  catch (error) {
    // Log unexpected errors
    console.error('Call Details API error:', error);

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