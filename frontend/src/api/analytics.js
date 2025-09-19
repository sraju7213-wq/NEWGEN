import api from './client';

export const fetchOverview = async () => {
  const { data } = await api.get('/analytics/overview');
  return data;
};
