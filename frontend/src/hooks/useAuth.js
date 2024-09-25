import { useState, useEffect, useCallback } from "react";
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
        const response = await axios.get("/auth/check", {
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

  return {
    isAuthenticated,
    setIsAuthenticated,
    loginUser,
    registerUser,
    logoutUser,
    loading,
  };
};

export default useAuth;
