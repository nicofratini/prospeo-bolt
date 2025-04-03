import { default as ElevenLabs } from 'npm:elevenlabs-node@2.0.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface RequestBody {
  text: string;
  voiceId?: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Get environment variables
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not set');
    }

    // Parse request body
    const { text, voiceId = 'EXAVITQu4vr4xnSDxMaL' } = await req.json() as RequestBody;

    if (!text) {
      throw new Error('Text is required');
    }

    // Initialize ElevenLabs client
    const voice = new ElevenLabs({
      apiKey: ELEVENLABS_API_KEY,
    });

    // Generate speech using the SDK
    const audioBuffer = await voice.textToSpeech({
      voiceId,
      textInput: text,
      modelId: 'eleven_multilingual_v2',
      voiceSettings: {
        stability: 0.5,
        similarityBoost: 0.75,
      },
    });

    // Return the audio file
    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    });
  }
  catch (error) {
    console.error('Text-to-speech error:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});