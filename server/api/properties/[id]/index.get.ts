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

    // Get property ID from params
    const propertyId = event.context.params?.id;
    if (!propertyId) {
      throw createError({
        statusCode: 400,
        message: 'Property ID is required',
      });
    }

    // Query the property
    const { data: property, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('user_id', session.user.id)
      .single();

    // Handle potential Supabase errors
    if (error) {
      console.error('Error fetching property:', error);
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          message: 'Property not found',
        });
      }
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch property',
      });
    }

    // Return the property
    return property as Database['public']['Tables']['properties']['Row'];
  }
  catch (error) {
    // Log unexpected errors
    console.error('Property API error:', error);

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