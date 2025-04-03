import { createError } from 'h3';
import { z } from 'zod';
import { getServerSession } from '#auth';
import supabase from '~/server/utils/supabase';
import type { Database } from '~/types/supabase';

// Define the property schema for validation
const propertySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().optional(),
  property_type: z.enum(['Maison', 'Appartement']).optional(),
  status: z.enum(['active', 'inactive', 'sold']).default('active'),
  price: z.number().positive().nullable(),
  description: z.string().optional(),
});

type PropertyInput = z.infer<typeof propertySchema>;

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

    // Read and validate the request body
    const body = await readBody(event);
    const validatedData = propertySchema.parse(body);

    // Insert the property into Supabase
    const { data: property, error: insertError } = await supabase
      .from('properties')
      .insert({
        ...validatedData,
        user_id: session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    // Handle potential Supabase errors
    if (insertError) {
      console.error('Error creating property on Supabase:', insertError);
      throw createError({
        statusCode: 500,
        message: `Failed to create property ${JSON.stringify(insertError)}`,
      });
    }

    // Set the response status to 201 Created
    setResponseStatus(event, 201);

    // Return the newly created property
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
