import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { login, register } from "../api/authentication";
import useAuth from "../hooks/useAuth";

const AuthPage = ({ setToast }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { isAuthenticated, loginUser, registerUser } = useAuth();
  console.log("Authenticated", isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let errors = {};
    if (isRegister && !formData.username)
      errors.username = "Username is required";
    if (!formData.email) errors.email = "Email is required";
    if (!formData.password || formData.password.length < 6)
      errors.password = "Password must be at least 6 characters long";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      // Submit the form (handle API integration here)
      if (isRegister) {
        // means user is registering
        try {
          const response = await registerUser(formData);
          setToast({
            color: "green",
            title: "Success",
            message: "Registration successful",
          });
        } catch (error) {
          setToast({
            color: "red",
            title: "Error",
            message: error.message,
          });
        }
      } else {
        // means user is logging in
        try {
          const response = await loginUser(formData);
          setToast({
            color: "green",
            title: "Success",
            message: "Login Successfully",
          });
        } catch (error) {
          setToast({
            color: "red",
            title: "Error",
            message: error.message,
          });
        }
      }
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className="bg-gray-100 p-8 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-2xl text-red-600 mb-4 text-center">
        {isRegister ? "Register" : "Login"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-md focus:ring focus:ring-red-500 outline-none selection:outline-none"
            />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username}</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-800">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-md focus:ring focus:ring-red-500 outline-none selection:outline-none"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-md focus:ring focus:ring-red-500 outline-none selection:outline-none"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          {isRegister ? "Register" : "Login"}
        </button>
      </form>

      <p className="text-gray-800 mt-4 text-center">
        {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          type="button"
          className="text-red-600 hover:underline"
          onClick={() => {
            setIsRegister(!isRegister);
            setFormData({
              username: "",
              email: "",
              password: "",
            });
          }}
        >
          {isRegister ? "Login" : "Register"}
        </button>
      </p>
    </div>
  );
};

export default AuthPage;
