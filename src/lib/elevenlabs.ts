/**
 * ElevenLabs Scribe v2 — speech-to-text client.
 * Sends an audio Blob to the transcription endpoint and returns the plain text.
 */
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
