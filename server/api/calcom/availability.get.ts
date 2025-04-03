import { createError } from 'h3';
import { getServerSession } from '#auth';
import { getCalComAvailability } from '~/server/utils/calcomClient';

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

    // Get query parameters
    const query = getQuery(event);
    const {
      dateFrom = new Date().toISOString(),
      dateTo = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to 7 days from now
      eventTypeId,
    } = query;

    // Prepare parameters for Cal.com API
    const params: Record<string, any> = {
      dateFrom,
      dateTo,
      ...(eventTypeId && { eventTypeId }),
    };

    // Fetch availability from Cal.com
    try {
      const availabilityResponse = await getCalComAvailability(session.user.id, params);
      return availabilityResponse;
    }
    catch (error: any) {
      console.error('Error fetching Cal.com availability:', error);
      
      // Handle specific Cal.com API errors
      if (error.response) {
        throw createError({
          statusCode: error.response.status || 502,
          message: error.response.data?.message || 'Failed to fetch availability from Cal.com',
        });
      }

      // Handle network or other errors
      throw createError({
        statusCode: 502,
        message: 'Failed to connect to Cal.com API',
      });
    }
  }
  catch (error) {
    // Log unexpected errors
    console.error('Availability API error:', error);

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