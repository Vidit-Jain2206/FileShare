import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 10000,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { response } = error;

    if (response) {
      // if (
      //   response.status === 401 &&
      //   response.data.message === "Not Authenticated. Please Login"
      // ) {
      //   // Attempt to refresh the token
      //   try {
      //     // await refreshAccessToken();
      //     // Retry the original request with the new access token
      //     // const originalRequest = response.config;
      //     // return apiClient(originalRequest);
      //   } catch (refreshError) {
      //     // Handle refresh token failure (e.g., log out the user)
      //     return Promise.reject(refreshError);
      //   }
      // } else
      if (
        (error.response.status === 401 &&
          error.response.data.message === "Not Authenticated. Please Login") ||
        (error.response.status === 400 &&
          error.response.data.message === "Not Authenticated. Please Login")
      ) {
        console.log("response: " + response);
        return Promise.reject(response);
      } else if (error.response.status === 404) {
        return Promise.reject(response);
      }
    }
    return Promise.reject(error);
  }
);
