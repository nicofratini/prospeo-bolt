import { createError } from 'h3';
import { getServerSession } from '#auth';
import supabase from '~/server/utils/supabase';

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

    // Update onboarding status in database
    const { error } = await supabase
      .from('users')
      .update({
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id);

    if (error) {
      console.error('Error updating onboarding status:', error);
      throw createError({
        statusCode: 500,
        message: 'Failed to update onboarding status',
      });
    }

    // Return success response
    return {
      completed: true,
    };
  }
  catch (error) {
    // Re-throw if it's already an H3 error
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    console.error('Onboarding completion API error:', error);

    // Return a generic error for unexpected issues
    throw createError({
      statusCode: 500,
      message: 'An unexpected error occurred',
    });
  }
});