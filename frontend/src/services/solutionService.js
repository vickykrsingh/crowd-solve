import api from './api.js';

export const solutionService = {
  getAllSolutions: async (params = {}) => {
    const response = await api.get('/solutions', { params });
    return response.data;
  },

  getSolutionsByProblem: async (problemId) => {
    const response = await api.get(`/solutions/problem/${problemId}`);
    return response.data;
  },

  getSolutionById: async (id) => {
    const response = await api.get(`/solutions/${id}`);
    return response.data;
  },

  createSolution: async (solutionData) => {
    const response = await api.post('/solutions', solutionData);
    return response.data;
  },

  updateSolution: async (id, solutionData) => {
    const response = await api.put(`/solutions/${id}`, solutionData);
    return response.data;
  },

  deleteSolution: async (id) => {
    const response = await api.delete(`/solutions/${id}`);
    return response.data;
  },

  upvoteSolution: async (id) => {
    const response = await api.post(`/solutions/${id}/upvote`);
    return response.data;
  },

  acceptSolution: async (id) => {
    const response = await api.post(`/solutions/${id}/accept`);
    return response.data;
  }
};