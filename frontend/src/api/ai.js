import api from './client';

export const requestPromptGeneration = async ({ seed, context }) => {
  const { data } = await api.post('/ai/generate', { seed, context });
  return data;
};

export const requestBatchGeneration = async (payload) => {
  const { data } = await api.post('/ai/batch', payload);
  return data;
};

export const requestChatCompletion = async (messages) => {
  const { data } = await api.post('/ai/chat', { messages });
  return data;
};

export const requestSpeechToText = async ({ audioContent, config }) => {
  const { data } = await api.post('/ai/speech-to-text', { audioContent, config });
  return data;
};
