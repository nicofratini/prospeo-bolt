import supabase from '~/server/utils/supabase';
import { getServerSession } from '#auth';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  if (!session || !session.user) {
    return createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, name, created_at, updated_at')
    .eq('id', session.user.id)
    .single();

  if (error || !user) {
    return createError({
      statusCode: 404,
      message: 'User not found',
    });
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
});
