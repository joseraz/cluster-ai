/**
 * ElevenLabs speech-to-text client.
 * - transcribeAudio: batch file upload (Scribe v2)
 * - getRealtimeApiKey: returns the API key for use as a WebSocket query param
 */

/**
 * Fetch a short-lived single-use token for the realtime WebSocket.
 * Correct endpoint: /v1/single-use-token/realtime_scribe
 * (Browser WebSockets can't set custom headers, so we exchange the API key
 * for a short-lived token here, then pass it as ?token= on the WSS URL.)
 */
export async function getRealtimeToken(): Promise<string> {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;
  if (!apiKey) throw new Error('VITE_ELEVENLABS_API_KEY is not configured');

  const res = await fetch('https://api.elevenlabs.io/v1/single-use-token/realtime_scribe', {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`ElevenLabs token ${res.status}: ${detail}`);
  }

  const data = (await res.json()) as { token?: string };
  if (!data.token) throw new Error('ElevenLabs token response missing token field');
  return data.token;
}

export async function transcribeAudio(blob: Blob): Promise<string> {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;
  if (!apiKey) throw new Error('VITE_ELEVENLABS_API_KEY is not configured');

  const formData = new FormData();
  // ElevenLabs infers format from the file extension; .webm works fine
  formData.append('file', blob, 'recording.webm');
  formData.append('model_id', 'scribe_v2');
  formData.append('tag_audio_events', 'false'); // clean output, no [laughter] tags
  formData.append('language_code', 'en');

  const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: { 'xi-api-key': apiKey },
    body: formData,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`ElevenLabs ${res.status}: ${detail}`);
  }

  const data = (await res.json()) as { text?: string };
  return data.text ?? '';
}
