import { createError } from 'h3';
import { getServerSession } from '#auth';
import supabase from '~/server/utils/supabase';
import type { Database } from '~/types/supabase';

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

    // Query properties for the authenticated user
    const { data: properties, error } = await supabase
      .from('properties')
      .select(`
        id,
        name,
        address,
        property_type,
        status,
        price,
        description,
        created_at,
        updated_at
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    // Handle potential Supabase errors
    if (error) {
      console.error('Error fetching properties:', error);
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch properties',
      });
    }

    // Return the properties
    return {
      properties: properties as Database['public']['Tables']['properties']['Row'][],
    };
  }
  catch (error) {
    // Log the error for debugging
    console.error('Properties API error:', error);

    // Re-throw if it's already an H3 error
    if (error.statusCode) {
      throw error;
    }

    // Otherwise, create a new error
    throw createError({
      statusCode: 500,
      message: 'An unexpected error occurred',
    });
  }
});