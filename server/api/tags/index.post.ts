import { createError } from 'h3';
import { getServerSession } from '#auth';
import { z } from 'zod';
import supabase from '~/server/utils/supabase';
import type { Database } from '~/types/supabase';

type Tag = Database['public']['Tables']['tags']['Row'];

// Validation schema for tag creation
const tagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name is too long'),
  color: z.string().nullable().optional(),
});

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

    // Read and validate request body
    const body = await readBody(event);
    const validatedData = tagSchema.parse(body);

    // Insert the tag into Supabase
    const { data: tag, error } = await supabase
      .from('tags')
      .insert({
        user_id: session.user.id,
        name: validatedData.name,
        color: validatedData.color || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    // Handle potential Supabase errors
    if (error) {
      console.error('Error creating tag:', error);
      if (error.code === '23505') { // Unique constraint violation
        throw createError({
          statusCode: 409,
          message: 'A tag with this name already exists',
        });
      }
      throw createError({
        statusCode: 500,
        message: 'Failed to create tag',
      });
    }

    // Set response status to 201 Created
    setResponseStatus(event, 201);

    return tag as Tag;
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
    console.error('Tags API error:', error);

    // Return a generic error for unexpected issues
    throw createError({
      statusCode: 500,
      message: 'An unexpected error occurred',
    });
  }
});