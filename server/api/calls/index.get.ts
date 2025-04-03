import { createError } from 'h3';
import { getServerSession } from '#auth';
import { z } from 'zod';
import supabase from '~/server/utils/supabase';
import type { Database } from '~/types/supabase';

type CallHistory = Database['public']['Tables']['call_history']['Row'];

interface CallWithProperty extends CallHistory {
  property: {
    id: string;
    name: string;
  } | null;
}

interface PaginatedResponse {
  calls: CallWithProperty[];
  pagination: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
  };
}

// Validation schema for query parameters
const querySchema = z.object({
  page: z.string().optional().transform(val => Math.max(1, parseInt(val || '1'))),
  limit: z.string().optional().transform(val => Math.min(50, Math.max(1, parseInt(val || '10')))),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['completed', 'missed', 'failed', 'in-progress']).optional(),
  propertyId: z.string().uuid().optional(),
  search: z.string().optional(),
});

export default defineEventHandler(async (event): Promise<PaginatedResponse> => {
  try {
    // Get the current user session
    const session = await getServerSession(event);
    if (!session?.user?.id) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      });
    }

    // Validate and parse query parameters
    const query = getQuery(event);
    const {
      page,
      limit,
      startDate,
      endDate,
      status,
      propertyId,
      search,
    } = querySchema.parse(query);

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Start building the query
    let dbQuery = supabase
      .from('call_history')
      .select(`
        id,
        call_timestamp,
        caller_number,
        duration_seconds,
        status,
        recording_url,
        summary,
        property:properties(id, name)
      `, { count: 'exact' })
      .eq('user_id', session.user.id);

    // Apply filters
    if (status) {
      dbQuery = dbQuery.eq('status', status);
    }

    if (propertyId) {
      dbQuery = dbQuery.eq('property_id', propertyId);
    }

    if (startDate) {
      dbQuery = dbQuery.gte('call_timestamp', startDate);
    }

    if (endDate) {
      // Adjust endDate to include the whole day
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      dbQuery = dbQuery.lte('call_timestamp', endOfDay.toISOString());
    }

    if (search) {
      // Search in caller_number OR summary (case-insensitive)
      dbQuery = dbQuery.or(`caller_number.ilike.%${search}%,summary.ilike.%${search}%`);
    }

    // Apply ordering and pagination
    const { data: calls, error, count } = await dbQuery
      .order('call_timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    // Handle potential Supabase errors
    if (error) {
      console.error('Error fetching calls:', error);
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch calls',
      });
    }

    // Calculate pagination values
    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    // Return paginated response
    return {
      calls: calls as CallWithProperty[],
      pagination: {
        totalItems,
        currentPage: page,
        itemsPerPage: limit,
        totalPages,
      },
    };
  }
  catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: error.errors.map(e => e.message).join(', '),
      });
    }

    // Log unexpected errors
    console.error('Calls API error:', error);

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