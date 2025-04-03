import { ofetch } from 'ofetch';
import { useRuntimeConfig } from '#imports';

/**
 * Helper function to get the Cal.com API key.
 * This can be extended later to handle user-specific API keys if needed.
 */
const getApiKey = (userId?: string): string => {
  // TODO: Implement logic to fetch user-specific Cal.com API key if needed.
  // For now, use the global key from runtimeConfig.
  const config = useRuntimeConfig();
  const apiKey = config.private.CALCOM_API_KEY;
  if (!apiKey) {
    console.error('Cal.com API Key is missing in Nuxt private runtime config.');
    throw new Error('Server Cal.com client configuration error.');
  }
  return apiKey;
};

/**
 * Create a configured ofetch instance for Cal.com API calls
 */
const calcomFetch = ofetch.create({
  baseURL: 'https://api.cal.com/v1',
  // Add authorization header with API key
  headers: {
    get Authorization() {
      return `Bearer ${getApiKey()}`;
    },
    'Content-Type': 'application/json',
  },
});

/**
 * Get availability for a user
 */
export const getCalComAvailability = async (userId?: string, params?: Record<string, any>) => {
  try {
    return await calcomFetch('/availability', {
      query: params,
    });
  }
  catch (error) {
    console.error('Error fetching Cal.com availability:', error);
    throw error;
  }
};

/**
 * Get bookings for a user
 */
export const getCalComBookings = async (userId?: string, params?: Record<string, any>) => {
  try {
    return await calcomFetch('/bookings', {
      query: params,
    });
  }
  catch (error) {
    console.error('Error fetching Cal.com bookings:', error);
    throw error;
  }
};

/**
 * Interface for event type information from Cal.com
 */
interface CalComEventType {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  length: number;
  hidden: boolean;
  userId: number;
  teamId: number | null;
  eventName: string;
  timeZone: string | null;
  periodType: string;
  periodStartDate: string | null;
  periodEndDate: string | null;
  periodDays: number | null;
  periodCountCalendarDays: boolean;
  requiresConfirmation: boolean;
  disableGuests: boolean;
  hideCalendarNotes: boolean;
  minimumBookingNotice: number;
  beforeEventBuffer: number;
  afterEventBuffer: number;
  schedulingType: string | null;
  price: number;
  currency: string;
  metadata: Record<string, any> | null;
  successRedirectUrl: string | null;
}

/**
 * Get event types from Cal.com
 * 
 * @param userId - Optional user ID to filter event types
 * @returns List of event types from Cal.com
 * @throws Error if the fetch fails
 */
export const getCalComEventTypes = async (userId?: string): Promise<CalComEventType[]> => {
  console.log('Fetching Cal.com event types...');
  try {
    const query: Record<string, any> = {};
    if (userId) {
      query.userId = userId;
    }

    const response = await calcomFetch<{ event_types: CalComEventType[] }>('/event-types', {
      query,
    });

    return response.event_types;
  }
  catch (error: any) {
    console.error('Error fetching Cal.com event types:', error);
    throw error;
  }
};

/**
 * Interface for attendee information in a booking
 */
interface CalComAttendee {
  email: string;
  name: string;
  timeZone: string;
  language?: {
    locale: string;
  };
}

/**
 * Interface for the booking payload sent to Cal.com
 */
interface CalComBookingPayload {
  eventTypeId: number;
  start: string;
  end: string;
  timeZone: string;
  language?: string;
  metadata?: Record<string, any>;
  responses: {
    name: string;
    email: string;
    location?: {
      optionValue: string;
      value: string;
    };
    notes?: string;
    guests?: string[];
  };
  hasHashedBookingLink?: boolean;
  hashedLink?: string | null;
  smsReminderNumber?: string | null;
}

/**
 * Interface for the booking response from Cal.com
 */
interface CalComBookingResponse {
  uid: string;
  eventTypeId: number;
  userId: number;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  timeZone: string;
  attendees: CalComAttendee[];
  status: 'ACCEPTED' | 'PENDING' | 'REJECTED' | 'CANCELLED';
  cancellationReason?: string;
  rejectionReason?: string;
  location?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create a new booking in Cal.com
 * 
 * @param bookingData - The booking data to be sent to Cal.com
 * @returns The created booking response from Cal.com
 * @throws Error if the booking creation fails
 */
export const createCalComBooking = async (
  bookingData: CalComBookingPayload
): Promise<CalComBookingResponse> => {
  console.log('Creating Cal.com booking with data:', bookingData);

  try {
    // Validate required fields
    if (!bookingData.eventTypeId) {
      throw new Error('eventTypeId is required');
    }
    if (!bookingData.start || !bookingData.end) {
      throw new Error('start and end times are required');
    }
    if (!bookingData.timeZone) {
      throw new Error('timeZone is required');
    }
    if (!bookingData.responses?.email || !bookingData.responses?.name) {
      throw new Error('attendee email and name are required');
    }

    // Create the booking via Cal.com API
    const response = await calcomFetch<CalComBookingResponse>('/bookings', {
      method: 'POST',
      body: bookingData,
    });

    console.log('Cal.com booking created successfully:', response);
    return response;
  }
  catch (error: any) {
    console.error('Error creating Cal.com booking:', error);

    // Enhance error message based on Cal.com API error response
    if (error.response?.data) {
      throw new Error(`Cal.com booking creation failed: ${error.response.data.message || 'Unknown error'}`);
    }

    // Re-throw original error if no specific error handling is needed
    throw error;
  }
};

/**
 * Delete a booking in Cal.com
 * 
 * @param bookingId - The ID of the booking to delete
 * @param reason - Optional reason for cancellation
 * @throws Error if the booking deletion fails
 */
export const deleteCalComBooking = async (
  bookingId: string | number,
  reason?: string
): Promise<void> => {
  console.log(`Attempting to delete Cal.com booking with ID: ${bookingId}`);

  try {
    // Validate booking ID
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    // Delete the booking via Cal.com API
    await calcomFetch(`/bookings/${bookingId}`, {
      method: 'DELETE',
      ...(reason && {
        body: {
          cancellationReason: reason,
        },
      }),
    });

    console.log(`Cal.com booking ${bookingId} deleted successfully.`);
  }
  catch (error: any) {
    console.error(`Error deleting Cal.com booking ${bookingId}:`, error);

    // Enhance error message based on Cal.com API error response
    if (error.response?.data) {
      throw new Error(`Cal.com booking deletion failed: ${error.response.data.message || 'Unknown error'}`);
    }

    // Re-throw original error if no specific error handling is needed
    throw error;
  }
};