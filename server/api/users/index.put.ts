import { z } from 'zod';
import supabase from '~/server/utils/supabase';
import { getServerSession } from '#auth';

const userUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
});

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  if (!session || !session.user) {
    return createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  try {
    const body = await readBody(event);
    const validatedData = userUpdateSchema.parse(body);

    // Update user in Supabase
    const { data: user, error } = await supabase
      .from('users')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id)
      .select('id, email, name, created_at, updated_at')
      .single();

    if (error) {
      return createError({
        statusCode: 400,
        message: error.message,
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }
  catch (error) {
    if (error instanceof z.ZodError) {
      return createError({
        statusCode: 400,
        message: error.errors.map(e => e.message).join(', '),
      });
    }

    return createError({
      statusCode: 500,
      message: 'An error occurred while updating the user',
    });
  }
});
