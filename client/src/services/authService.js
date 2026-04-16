import { apiClient } from "./apiClient";

const TOKEN_KEY = "raiseit_token";

export const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

const authClient = apiClient;

authClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = async (payload) => {
  const response = await authClient.post("/auth/register", payload);
  const data = response.data?.data;
  if (data?.token) {
    saveToken(data.token);
  }
  return data;
};

export const loginUser = async (payload) => {
  const response = await authClient.post("/auth/login", payload);
  const data = response.data?.data;
  if (data?.token) {
    saveToken(data.token);
  }
  return data;
};

export const getCurrentUser = async () => {
  const response = await authClient.get("/auth/me");
  return response.data?.data;
};

export const googleLogin = async (credential) => {
  const response = await authClient.post("/auth/google", { credential });
  const data = response.data?.data;
  if (data?.token) {
    saveToken(data.token);
  }
  return data;
};
