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

    // Fetch tags for the authenticated user
    const { data: tags, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', session.user.id)
      .order('name');

    // Handle potential Supabase errors
    if (error) {
      console.error('Error fetching tags:', error);
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch tags',
      });
    }

    return tags as Tag[];
  }
  catch (error) {
    // Log unexpected errors
    console.error('Tags API error:', error);

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