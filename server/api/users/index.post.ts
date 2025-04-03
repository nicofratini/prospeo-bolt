import { createError } from 'h3';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import supabase from '~/server/utils/supabase';

// Validation schema for user registration
const userSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default defineEventHandler(async (event) => {
  try {
    // Read and validate request body
    const body = await readBody(event);
    const validatedData = userSchema.parse(body);

    // Check if email already exists
    const { error: countError, count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('email', validatedData.email);

    if (countError) {
      console.error('Error checking existing user:', countError);
      throw createError({
        statusCode: 500,
        message: 'Failed to check existing user',
      });
    }

    if (count && count > 0) {
      throw createError({
        statusCode: 409,
        message: 'Email already in use',
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Insert user into Supabase
    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert({
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id, email, name, created_at, updated_at')
      .single();

    if (insertError) {
      console.error('Error creating user on Supabase:', insertError);
      throw createError({
        statusCode: 500,
        message: 'Failed to create user',
      });
    }

    // Set response status to 201 Created
    setResponseStatus(event, 201);

    // Return the created user (excluding sensitive data)
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
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

    // Re-throw if it's already an H3 error
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    console.error('User registration error:', error);

    // Return a generic error for unexpected issues
    throw createError({
      statusCode: 500,
      message: 'An unexpected error occurred while creating the user',
    });
  }
});
