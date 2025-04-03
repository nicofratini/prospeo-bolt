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

    // Get tag ID from params
    const tagId = event.context.params?.id;
    if (!tagId) {
      throw createError({
        statusCode: 400,
        message: 'Tag ID is required',
      });
    }

    // Delete the tag from Supabase
    const { error, count } = await supabase
      .from('tags')
      .delete()
      .eq('id', tagId)
      .eq('user_id', session.user.id); // Ensure user owns the tag

    // Handle potential Supabase errors
    if (error) {
      console.error('Error deleting tag:', error);
      throw createError({
        statusCode: 500,
        message: 'Failed to delete tag',
      });
    }

    // Check if any row was actually deleted
    if (!count) {
      throw createError({
        statusCode: 404,
        message: 'Tag not found',
      });
    }

    // Set response status to 204 No Content
    setResponseStatus(event, 204);

    // Return null as there is no content to return
    return null;
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