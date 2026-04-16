import { apiClient } from "./apiClient";

export const getPublicDashboard = async () => {
  const response = await apiClient.get("/dashboard/public");
  return response.data?.data;
};
