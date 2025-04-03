import { createError } from 'h3';
import { getServerSession } from '#auth';
import supabase from '~/server/utils/supabase';
import type { Database } from '~/types/supabase';

type AgentConfig = Database['public']['Tables']['ai_agents']['Row'];

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

    // Fetch the agent configuration
    const { data: agent, error } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    // Handle potential Supabase errors
    if (error) {
      if (error.code === 'PGRST116') {
        // No agent configuration found
        return null;
      }
      console.error('Error fetching agent configuration:', error);
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch agent configuration',
      });
    }

    return agent as AgentConfig;
  }
  catch (error) {
    // Log unexpected errors
    console.error('AI Agent API error:', error);

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