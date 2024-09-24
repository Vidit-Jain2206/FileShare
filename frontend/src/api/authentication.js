import { apiClient } from "./apiinstance";

const BASE_URL = "http://localhost:3000";

export const login = async (formData) => {
  try {
    const response = await apiClient.post(`${BASE_URL}/users/login`, formData, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    throw new Error(error.response.data.error);
  }
};
export const register = async (formData) => {
  try {
    const response = await apiClient.post(
      `${BASE_URL}/users/register`,
      formData,
      {
        withCredentials: true,
      }
    );
    return response;
  } catch (error) {
    throw new Error(error.response.data.error);
  }
};

export const logout = async () => {
  try {
    const response = await apiClient.post(`${BASE_URL}/users/logout`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    throw new Error(error.response.data.error);
  }
};
