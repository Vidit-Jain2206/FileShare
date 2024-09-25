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

export const getAllFiles = async () => {
  try {
    const response = await apiClient.get(`${BASE_URL}/users/files`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        error?.data?.message
    );
  }
};

export const changeVisibility = async (id, value) => {
  try {
    const response = await apiClient.put(
      `${BASE_URL}/files/change-status`,
      { status: value, fileId: id },
      {
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
