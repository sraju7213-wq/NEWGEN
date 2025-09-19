import api from './client';

export const fetchPrompts = async () => {
  const { data } = await api.get('/prompts');
  return data.prompts;
};

export const createPrompt = async (payload) => {
  const { data } = await api.post('/prompts', payload);
  return data.prompt;
};

export const updatePrompt = async ({ id, ...payload }) => {
  const { data } = await api.put(`/prompts/${id}`, payload);
  return data.prompt;
};

export const deletePrompt = async (id) => {
  await api.delete(`/prompts/${id}`);
  return id;
};

export const generateSuggestion = async (id) => {
  const { data } = await api.post(`/prompts/${id}/suggestions`);
  return data;
};

export const uploadPromptImage = async ({ file, promptId }) => {
  const formData = new FormData();
  formData.append('image', file);
  if (promptId) formData.append('promptId', promptId);
  const { data } = await api.post('/prompts/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data.image;
};
