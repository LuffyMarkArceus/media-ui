import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

export function useAxiosAuth() {
  const { getToken } = useAuth();

  const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_URL,
  });

  instance.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
}
