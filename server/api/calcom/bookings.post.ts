import { createError } from 'h3';
import { getServerSession } from '#auth';
import { z } from 'zod';
import { createCalComBooking } from '~/server/utils/calcomClient';

// Validation schema for booking request
const bookingSchema = z.object({
  eventTypeId: z.number({
    required_error: 'Event type ID is required',
    invalid_type_error: 'Event type ID must be a number',
  }),
  start: z.string({
    required_error: 'Start time is required',
  }).datetime({
    message: 'Start time must be a valid ISO datetime string',
  }),
  end: z.string({
    required_error: 'End time is required',
  }).datetime({
    message: 'End time must be a valid ISO datetime string',
  }),
  timeZone: z.string({
    required_error: 'Time zone is required',
  }),
  language: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  responses: z.object({
    name: z.string({
      required_error: 'Attendee name is required',
    }).min(1, 'Name cannot be empty'),
    email: z.string({
      required_error: 'Email is required',
    }).email('Invalid email format'),
    location: z.object({
      optionValue: z.string(),
      value: z.string(),
    }).optional(),
    notes: z.string().optional(),
    guests: z.array(z.string().email('Invalid guest email format')).optional(),
  }),
  hasHashedBookingLink: z.boolean().optional(),
  hashedLink: z.string().nullable().optional(),
  smsReminderNumber: z.string().nullable().optional(),
});

export default defineEventHandler(async (event) => {
  try {
    // Verify authentication
    const session = await getServerSession(event);
    if (!session?.user?.id) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      });
    }

    // Read and validate request body
    const body = await readBody(event);
    const validatedBody = bookingSchema.parse(body);

    // Validate that end time is after start time
    const startTime = new Date(validatedBody.start);
    const endTime = new Date(validatedBody.end);
    if (endTime <= startTime) {
      throw createError({
        statusCode: 400,
        message: 'End time must be after start time',
      });
    }

    try {
      // Create booking via Cal.com
      const newBooking = await createCalComBooking(validatedBody);

      // Set response status to 201 Created
      setResponseStatus(event, 201);

      return newBooking;
    }
    catch (error: any) {
      console.error('Error creating Cal.com booking:', error);

      // Handle specific Cal.com API errors
      if (error.response?.status) {
        throw createError({
          statusCode: error.response.status,
          message: error.response.data?.message || 'Failed to create booking via Cal.com',
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
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: error.errors.map(e => e.message).join(', '),
      });
    }

    // Re-throw if it's already an H3 error
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    console.error('Unexpected error in bookings POST handler:', error);

    // Return a generic error for unexpected issues
    throw createError({
      statusCode: 500,
      message: 'An unexpected error occurred while creating the booking',
    });
  }
});