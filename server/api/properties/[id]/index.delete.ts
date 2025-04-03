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

    // Get property ID from params
    const propertyId = event.context.params?.id;
    if (!propertyId) {
      throw createError({
        statusCode: 400,
        message: 'Property ID is required',
      });
    }

    // Delete the property from Supabase
    const { error, count } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId)
      .eq('user_id', session.user.id); // Ensure user owns the property

    // Handle potential Supabase errors
    if (error) {
      console.error('Error deleting property:', error);
      throw createError({
        statusCode: 500,
        message: 'Failed to delete property',
      });
    }

    // Check if any row was actually deleted
    if (!count) {
      throw createError({
        statusCode: 404,
        message: 'Property not found',
      });
    }

    // Set response status to 204 No Content
    setResponseStatus(event, 204);

    // Return null as there is no content to return
    return null;
  }
  catch (error) {
    // Log unexpected errors
    console.error('Properties API error:', error);

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