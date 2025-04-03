import { createError } from 'h3';
import { getServerSession } from '#auth';
import supabase from '~/server/utils/supabase';

export default defineEventHandler(async (event) => {
  try {
    return {
      completed: false,
    };
    // Get the current user session
    const session = await getServerSession(event);
    if (!session?.user?.id) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      });
    }

    // Fetch onboarding status from database
    const { data: user, error } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching onboarding status:', error);
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch onboarding status',
      });
    }

    return {
      completed: user?.onboarding_completed || false,
    };
  }
  catch (error) {
    // Re-throw if it's already an H3 error
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    console.error('Onboarding status API error:', error);

    // Return a generic error for unexpected issues
    throw createError({
      statusCode: 500,
      message: 'An unexpected error occurred',
    });
  }
});
