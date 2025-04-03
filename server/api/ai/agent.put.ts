import { createError } from 'h3';
import { getServerSession } from '#auth';
import { z } from 'zod';
import supabase from '~/server/utils/supabase';
import type { Database } from '~/types/supabase';

type AgentConfig = Database['public']['Tables']['ai_agents']['Row'];

// Validation schema for agent configuration
const agentConfigSchema = z.object({
  agent_name: z.string().min(1, 'Agent name is required'),
  elevenlabs_voice_id: z.string().min(1, 'Voice ID is required'),
  system_prompt: z.string().optional(),
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

    // Read and validate request body
    const body = await readBody(event);
    const validatedData = agentConfigSchema.parse(body);

    // Prepare the data for upsert
    const agentData = {
      user_id: session.user.id,
      ...validatedData,
      updated_at: new Date().toISOString(),
    };

    // Upsert the agent configuration
    const { data: agent, error } = await supabase
      .from('ai_agents')
      .upsert(agentData, {
        onConflict: 'user_id',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    // Handle potential Supabase errors
    if (error) {
      console.error('Error upserting agent configuration:', error);
      throw createError({
        statusCode: 500,
        message: 'Failed to save agent configuration',
      });
    }

    return agent as AgentConfig;
  }
  catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: error.errors.map(e => e.message).join(', '),
      });
    }

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