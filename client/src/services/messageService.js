import { apiClient } from "./apiClient";

export const getCommunityMessages = async (communityId) => {
  const response = await apiClient.get(`/communities/${communityId}/messages`);
  return response.data?.data || { messages: [], isChatLocked: false };
};

export const sendCommunityMessage = async (communityId, payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });

  const response = await apiClient.post(`/communities/${communityId}/messages`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data?.data?.message;
};
