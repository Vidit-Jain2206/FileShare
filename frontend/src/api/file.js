import { apiClient } from "./apiinstance";

const BASE_URL = "http://localhost:3000";

export const uploadfile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await apiClient.post(
      `${BASE_URL}/users/uploads`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        error?.data?.message
    );
  }
};
