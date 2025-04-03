export function useTextToSpeech() {
  const config = useRuntimeConfig();
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function generateSpeech(text: string, voiceId?: string) {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await fetch(
        `${config.public.supabaseUrl}/functions/v1/text-to-speech`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.public.supabaseAnonKey}`,
          },
          body: JSON.stringify({ text, voiceId }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate speech');
      }

      // Get the audio blob
      const audioBlob = await response.blob();

      // Create an object URL for the audio
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio
      const audio = new Audio(audioUrl);
      await audio.play();

      // Clean up the object URL when the audio finishes playing
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };

      return audio;
    }
    catch (err: any) {
      error.value = err.message || 'An unexpected error occurred';
      throw err;
    }
    finally {
      isLoading.value = false;
    }
  }

  return {
    generateSpeech,
    isLoading,
    error,
  };
}