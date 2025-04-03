import { createError } from 'h3';
import { getServerSession } from '#auth';
import { useElevenLabsClient } from '~/server/utils/elevenlabs';

export default defineEventHandler(async (event) => {
  try {
    // Get the current user session
    const session = await getServerSession(event);
    if (!session?.user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      });
    }

    // Get the initialized ElevenLabs client
    const elevenlabsClient = useElevenLabsClient();

    // Fetch all available voices
    const voices = await elevenlabsClient.voices.getAll();

    // Return the voices array
    return {
      voices: voices.map(voice => ({
        id: voice.voice_id,
        name: voice.name,
        category: voice.category,
        description: voice.description,
        previewUrl: voice.preview_url,
        settings: voice.settings,
        labels: voice.labels,
      })),
    };
  }
  catch (error) {
    // Log the error for debugging
    console.error('Error fetching ElevenLabs voices:', error);

    // Re-throw if it's already an H3 error
    if (error.statusCode) {
      throw error;
    }

    // Return a generic error for unexpected issues
    throw createError({
      statusCode: 502,
      message: 'Failed to fetch voices from ElevenLabs',
    });
  }
});