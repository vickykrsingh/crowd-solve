import api from './api.js';

export const commentService = {
  getComments: async (entityType, entityId) => {
    const response = await api.get(`/comments/${entityType}/${entityId}`);
    return response.data;
  },

  createComment: async (commentData) => {
    const response = await api.post('/comments', commentData);
    return response.data;
  },

  updateComment: async (id, commentData) => {
    const response = await api.put(`/comments/${id}`, commentData);
    return response.data;
  },

  deleteComment: async (id) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  },

  upvoteComment: async (id) => {
    const response = await api.post(`/comments/${id}/upvote`);
    return response.data;
  }
};