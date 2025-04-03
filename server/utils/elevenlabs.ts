import { default as ElevenLabs } from 'elevenlabs-node';
import { useRuntimeConfig } from '#imports';

let elevenlabsClientInstance: ElevenLabs | null = null;

/**
 * Returns an initialized ElevenLabs SDK client using the API key from Nuxt runtime config.
 * This utility is intended for server-side API routes that need to interact with ElevenLabs
 * directly, complementing the Edge Function implementation for text-to-speech generation.
 * 
 * Use cases:
 * - Retrieving available voices
 * - Managing voice settings
 * - Accessing history
 * - Voice cloning operations
 * 
 * @throws {Error} If the ElevenLabs API key is not configured
 * @returns {ElevenLabs} An initialized ElevenLabs client instance
 */
export function useElevenLabsClient(): ElevenLabs {
  if (!elevenlabsClientInstance) {
    const config = useRuntimeConfig();
    const apiKey = config.private.ELEVENLABS_API_KEY;

    if (!apiKey) {
      console.error('ElevenLabs API Key is missing in Nuxt server runtime config.');
      throw new Error('Server ElevenLabs client configuration error.');
    }

    elevenlabsClientInstance = new ElevenLabs({
      apiKey,
    });
  }

  return elevenlabsClientInstance;
}

/**
 * Resets the ElevenLabs client instance.
 * Useful for testing or when you need to force a new client initialization.
 */
export function resetElevenLabsClient(): void {
  elevenlabsClientInstance = null;
}