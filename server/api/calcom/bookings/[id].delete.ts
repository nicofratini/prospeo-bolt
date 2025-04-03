import { createError } from 'h3';
import { getServerSession } from '#auth';
import { deleteCalComBooking } from '~/server/utils/calcomClient';

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

    // Get booking ID from params
    const bookingId = event.context.params?.id;
    if (!bookingId) {
      throw createError({
        statusCode: 400,
        message: 'Booking ID is required',
      });
    }

    // Optional: Get cancellation reason from query params
    const query = getQuery(event);
    const reason = query.reason as string | undefined;

    try {
      // Delete the booking via Cal.com
      await deleteCalComBooking(bookingId, reason);

      // Set response status to 204 No Content
      setResponseStatus(event, 204);
      return null;
    }
    catch (error: any) {
      console.error(`Error deleting Cal.com booking ${bookingId}:`, error);

      // Handle specific Cal.com API errors
      if (error.response?.status) {
        throw createError({
          statusCode: error.response.status,
          message: error.response.data?.message || 'Failed to delete booking via Cal.com',
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
    console.error('Unexpected error in bookings DELETE handler:', error);

    // Return a generic error for unexpected issues
    throw createError({
      statusCode: 500,
      message: 'An unexpected error occurred while deleting the booking',
    });
  }
});