import { apiClient } from "./apiClient";

export const getCommunities = async () => {
  const response = await apiClient.get("/communities");
  return response.data?.data?.communities || [];
};

export const getCommunityById = async (id) => {
  const response = await apiClient.get(`/communities/${id}`);
  return response.data?.data || null;
};

export const joinCommunity = async (id, isAnonymous = false) => {
  const response = await apiClient.post(`/communities/${id}/join`, { isAnonymous });
  return response.data?.data;
};
