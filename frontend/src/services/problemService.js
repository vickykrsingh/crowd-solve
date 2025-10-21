import api from './api.js';

export const problemService = {
  getProblems: async (params = {}) => {
    const response = await api.get('/problems', { params });
    return response.data;
  },

  getProblemById: async (id) => {
    const response = await api.get(`/problems/${id}`);
    return response.data;
  },

  createProblem: async (formData) => {
    const response = await api.post('/problems', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // Returns the full API response: { success, message, data }
  },

  updateProblem: async (id, problemData) => {
    const response = await api.put(`/problems/${id}`, problemData);
    return response.data;
  },

  deleteProblem: async (id) => {
    const response = await api.delete(`/problems/${id}`);
    return response.data;
  },

  upvoteProblem: async (id) => {
    const response = await api.post(`/problems/${id}/upvote`);
    return response.data;
  },

  getUserProblems: async (userId) => {
    const response = await api.get(`/users/${userId}/problems`);
    return response.data;
  }
};