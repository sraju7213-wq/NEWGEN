const { SpeechClient } = require('@google-cloud/speech');

let speechClient;

function getSpeechClient() {
  if (!speechClient) {
    speechClient = new SpeechClient();
  }
  return speechClient;
}

async function transcribeBase64Audio(base64Audio, { languageCode = process.env.SPEECH_LANGUAGE_CODE || 'en-US', encoding = 'WEBM_OPUS', sampleRateHertz = 48000 } = {}) {
  if (!base64Audio) {
    throw new Error('Audio content is required');
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GOOGLE_CLOUD_PROJECT) {
    return 'Mock transcript: ' + base64Audio.slice(0, 50);
  }

  const client = getSpeechClient();
  const [response] = await client.recognize({
    audio: {
      content: base64Audio
    },
    config: {
      languageCode,
      encoding,
      sampleRateHertz,
      enableAutomaticPunctuation: true,
      model: 'latest_long'
    }
  });

  const transcript = response.results
    .flatMap((result) => result.alternatives || [])
    .map((alternative) => alternative.transcript)
    .join(' ');

  return transcript.trim();
}

module.exports = {
  transcribeBase64Audio
};
