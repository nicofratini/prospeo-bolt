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

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', session.user.id);

  if (error) {
    return createError({
      statusCode: 500,
      message: error.message,
    });
  }

  return { success: true };
});
