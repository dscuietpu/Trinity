import { apiClient } from "./apiClient";

export const getMyRewards = async () => {
  const response = await apiClient.get("/rewards/my");
  return response.data?.data?.rewards || [];
};
