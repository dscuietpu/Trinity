import { apiClient } from "./apiClient";

export const getIssueComments = async (issueId) => {
  const response = await apiClient.get(`/comments/${issueId}`);
  return response.data?.data?.comments || [];
};

export const createComment = async (payload) => {
  const response = await apiClient.post("/comments", payload);
  return response.data?.data?.comment;
};

export const reactToComment = async (commentId, emoji) => {
  const response = await apiClient.post(`/comments/${commentId}/reactions`, { emoji });
  return response.data?.data?.comment;
};
