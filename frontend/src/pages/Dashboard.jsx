import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { uploadfile as uploadFileAPI } from "../api/file";

const Dashboard = ({ setToast }) => {
  const [files, setFiles] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Track loading state for file upload
  const [fileUploadError, setFileUploadError] = useState(""); // Error message for file upload
  const { isAuthenticated, setIsAuthenticated, logoutUser } = useAuth();
  const [uploadedFile, setUploadedFile] = useState(null); // Store the uploaded file
  const [fileName, setFileName] = useState(""); // Store the file name
  const navigate = useNavigate();
  useEffect(() => {
    // fetchfiles();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const maxSize = 2 * 1024 * 1024; // 2 MB

    if (file) {
      if (file.type !== "application/pdf") {
        setFileUploadError("Only PDF files are allowed.");
      } else if (file.size > maxSize) {
        setFileUploadError("File size exceeds the 2MB limit.");
      } else {
        setFileUploadError("");
        setUploadedFile(file);
        setFileName(file.name); // Set the file name for display
      }
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadedFile) return;
    try {
      setLoading(true);
      const response = await uploadFileAPI(uploadedFile);
      setUploadedFile(null);
      setFileName("");
      setToast({
        color: "green",
        title: "Success",
        message: "File uploaded successfully!",
      });
    } catch (error) {
      if (error.message === "Not Authenticated. Please Login") {
        setIsAuthenticated(false);
        setToast({
          color: "red",
          title: "Error",
          message: "Not authenticated. Please login to upload files.",
        });
        navigate("/");
        return;
      }
      setUploadedFile(null);
      setFileName("");
      setToast({
        color: "red",
        title: "Error",
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8e3e3]">
      {/* Navbar */}
      <nav className="bg-red-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-lg font-bold">My Dashboard</h1>
        <div className="relative">
          <button onClick={handleDropdownToggle} className="flex items-center">
            <span className="material-icons">account_circle</span>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <button
                onClick={() => logoutUser()}
                className="block px-4 py-2 text-gray-800 hover:bg-gray-200 w-full text-left"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* File Upload Section */}
      <div className="flex-grow flex flex-col items-center p-4">
        <h2 className="text-2xl text-red-600 mb-4">Upload Files</h2>
        <div className="w-full max-w-lg bg-gray-100 rounded-lg shadow-lg p-4">
          <div className="border-2 border-dashed border-red-600 p-6 rounded-lg bg-white text-center">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="fileUpload"
            />
            <label
              htmlFor="fileUpload"
              className="cursor-pointer text-red-600 font-semibold"
            >
              {fileName ? `Selected file: ${fileName}` : "Click to upload PDF"}
            </label>
          </div>
          {fileUploadError && (
            <p className="text-red-600 mt-2">{fileUploadError}</p>
          )}
          <button
            onClick={handleFileUpload}
            disabled={loading}
            className={`w-full mt-4 py-2 text-white font-bold rounded ${
              loading
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      {/* File List Section */}
      <div className="flex-grow flex flex-col items-center p-4">
        <h2 className="text-2xl text-red-600 mb-4">My Files</h2>
        <div className="w-full max-w-3xl bg-gray-100 rounded-lg shadow-lg p-4 overflow-y-auto h-96">
          <div className="space-y-2">
            {files.length > 0 ? (
              files.map((file) => (
                <div
                  key={file.id}
                  className="p-2 border-b border-gray-300 grid grid-cols-2 place-items-start"
                >
                  <Link
                    to={file.fileUrl || "#"}
                    className="hover:underline hover:text-blue-500"
                  >
                    {file.name}
                  </Link>
                  <div className="flex items-center space-x-4">
                    {/* File visibility dropdown */}
                    <select
                      className="px-2 py-1 border border-gray-300 rounded-md text-red-600 bg-white hover:bg-red-100 focus:ring-2 focus:ring-red-600 outline-none"
                      value={file.visibility || "PRIVATE"}
                      disabled={loading}
                    >
                      <option value="PUBLIC">Public</option>
                      <option value="PRIVATE">Private</option>
                    </select>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No files available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
