import axios from "axios";

const BASE_URL = "http://localhost:3000";

export const login = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}/users/login`, formData);
    return response;
  } catch (error) {
    throw new Error(error.response.data.error);
  }
};
export const register = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}/users/register`, formData);
    return response;
  } catch (error) {
    console.log(error);
    throw new Error(error.response.data.error);
  }
};
