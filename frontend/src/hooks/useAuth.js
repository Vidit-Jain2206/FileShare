import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { login, logout, register } from "../api/authentication";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:3000/auth/check", {
          withCredentials: true,
        });
        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loginUser = async (formData) => {
    try {
      const response = await login(formData);
      setIsAuthenticated(true);
      navigate("/dashboard");
      return response;
    } catch (error) {
      setIsAuthenticated(false);
      throw new Error(error.message);
    }
  };

  const registerUser = async (formData) => {
    try {
      const response = await register(formData);
      setIsAuthenticated(true);
      navigate("/dashboard");
      return response;
    } catch (error) {
      setIsAuthenticated(false);
      throw new Error(error.message);
    }
  };

  const logoutUser = async () => {
    try {
      const response = await logout();
      setIsAuthenticated(false);
      navigate("/");
      return response;
    } catch (error) {
      setIsAuthenticated(true);
      throw new Error(error.message);
    }
  };

  useEffect(() => {
    const axiosInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response.status === 401) {
          logoutUser();
          navigate("/");
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(axiosInterceptor);
  }, []);

  return { isAuthenticated, loginUser, registerUser, logoutUser, loading };
};

export default useAuth;
