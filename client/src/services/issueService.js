import { apiClient } from "./apiClient";

export const getIssues = async () => {
  const response = await apiClient.get("/issues");
  return response.data?.data?.issues || [];
};

export const getIssueById = async (id) => {
  const response = await apiClient.get(`/issues/${id}`);
  return response.data?.data?.issue;
};

export const createIssue = async (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });

  const response = await apiClient.post("/issues", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data?.data?.issue;
};

export const upvoteIssue = async (id) => {
  const response = await apiClient.post(`/issues/${id}/upvote`);
  return response.data?.data?.issue;
};

export const deleteIssue = async (id) => {
  const response = await apiClient.delete(`/issues/${id}`);
  return response.data?.data;
};

export const resolveIssue = async (id) => {
  const response = await apiClient.patch(`/issues/${id}/resolve`);
  return response.data?.data?.issue;
};
