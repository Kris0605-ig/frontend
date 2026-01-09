import axios from "axios";

const API_BASE_URL = "https://truyen-7lnw.onrender.com";

const httpAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 👉 CHỈ GẮN TOKEN CHO API CẦN AUTH
httpAxios.interceptors.request.use(
  (config) => {
    const isAuthApi =
      config.url.includes("/api/login") ||
      config.url.includes("/api/register");

    if (!isAuthApi) {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default httpAxios;
