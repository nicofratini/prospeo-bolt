import { createError } from 'h3';
import { getServerSession } from '#auth';
import { z } from 'zod';
import supabase from '~/server/utils/supabase';
import type { Database } from '~/types/supabase';

// Define the property update schema for validation
const propertyUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().optional(),
  property_type: z.enum(['Maison', 'Appartement']).optional(),
  status: z.enum(['active', 'inactive', 'sold']).default('active'),
  price: z.number().positive().nullable(),
  description: z.string().optional(),
});

type PropertyUpdateInput = z.infer<typeof propertyUpdateSchema>;

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

    // Read and validate the request body
    const body = await readBody(event);
    const validatedData = propertyUpdateSchema.parse(body);

    // Update the property in Supabase
    const { data: property, error: updateError } = await supabase
      .from('properties')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', propertyId)
      .eq('user_id', session.user.id) // Ensure user owns the property
      .select()
      .single();

    // Handle potential Supabase errors
    if (updateError) {
      console.error('Error updating property:', updateError);
      if (updateError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          message: 'Property not found',
        });
      }
      throw createError({
        statusCode: 500,
        message: 'Failed to update property',
      });
    }

    // Return the updated property
    return property as Database['public']['Tables']['properties']['Row'];
  }
  catch (error) {
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
    console.error('Properties API error:', error);

    // Return a generic error for unexpected issues
    throw createError({
      statusCode: 500,
      message: 'An unexpected error occurred',
    });
  }
});