import { createError } from 'h3';
import { getServerSession } from '#auth';
import { getCalComEventTypes } from '~/server/utils/calcomClient';

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

    try {
      // Fetch event types from Cal.com
      const eventTypes = await getCalComEventTypes(session.user.id);

      // Return only necessary fields to reduce payload size
      return eventTypes.map(eventType => ({
        id: eventType.id,
        title: eventType.title,
        slug: eventType.slug,
        description: eventType.description,
        length: eventType.length,
        hidden: eventType.hidden,
        price: eventType.price,
        currency: eventType.currency,
      }));
    }
    catch (error: any) {
      console.error('Error fetching Cal.com event types:', error);

      // Handle specific Cal.com API errors
      if (error.response?.status) {
        throw createError({
          statusCode: error.response.status,
          message: error.response.data?.message || 'Failed to fetch event types from Cal.com',
        });
      }

      // Default to 502 Bad Gateway for external service errors
      throw createError({
        statusCode: 502,
        message: 'Failed to communicate with Cal.com service',
      });
    }
  }
  catch (error: any) {
    // Re-throw if it's already an H3 error
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    console.error('Unexpected error in event types GET handler:', error);

    // Return a generic error for unexpected issues
    throw createError({
      statusCode: 500,
      message: 'An unexpected error occurred while fetching event types',
    });
  }
});