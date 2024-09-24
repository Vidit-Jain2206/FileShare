import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [formData, setFormData] = useState({ password: "", email: "" });
  const [loading, setLoading] = useState(null); // Track loading state for each file
  const [fileUploadError, setFileUploadError] = useState(""); // Error message for file upload
  const { logoutUser } = useAuth();
  // Dummy files for testing
  const dummyFiles = [
    {
      id: 1,
      name: "Document 1.pdf",
      visibility: "PUBLIC",
      publicUrl: "http://www.google.com",
      fileUrl: "https://www.youtube.com",
    },
    // More dummy files...
  ];

  useEffect(() => {
    // Simulate fetching files from the backend
    setFiles(dummyFiles);
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const maxSize = 2 * 1024 * 1024; // 2 MB

    if (file) {
      if (file.type !== "application/pdf") {
        setFileUploadError("Only PDF files are allowed.");
      } else if (file.size > maxSize) {
        setFileUploadError("File size exceeds the 2MB limit.");
      } else {
        setFileUploadError("");
        // Handle successful file upload here, e.g., save file to backend
        console.log("File uploaded:", file.name);
        // Add file to list of uploaded files
        setFiles([...files, { id: files.length + 1, name: file.name }]);
      }
    }
  };

  const handleAccountOptions = (type) => {
    setModalType(type);
    setIsModalOpen(true);
    setIsDropdownOpen(false); // Close dropdown when option is selected
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false); // Close dropdown when modal is closed
    setFormData({ password: "", email: "" }); // Reset form data
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted:", formData);
    handleCloseModal();
  };

  const handleFileVisibilityChange = async (fileId, newVisibility) => {
    setLoading(fileId); // Show loader for this file
    try {
      // Simulate API request
      console.log(
        `Updating visibility for file ID: ${fileId}, new visibility: ${newVisibility}`
      );
      // Update file visibility in state
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.id === fileId ? { ...file, visibility: newVisibility } : file
        )
      );
    } catch (error) {
      console.error("Error updating file visibility:", error);
    } finally {
      setLoading(null); // Hide loader after request is completed
    }
  };

  return (
    <div className="min-h-screen  flex flex-col bg-[#f8e3e3]">
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
                onClick={() => handleAccountOptions("change-password")}
                className="block px-4 py-2 text-gray-800 hover:bg-gray-200 w-full text-left"
              >
                Change Password
              </button>
              <button
                onClick={() => handleAccountOptions("forgot-password")}
                className="block px-4 py-2 text-gray-800 hover:bg-gray-200 w-full text-left"
              >
                Forgot Password
              </button>
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
              onChange={handleFileUpload}
              className="hidden"
              id="fileUpload"
            />
            <label
              htmlFor="fileUpload"
              className="cursor-pointer text-red-600 font-semibold"
            >
              Drag & drop or click to upload PDF
            </label>
          </div>
          {fileUploadError && (
            <p className="text-red-600 mt-2">{fileUploadError}</p>
          )}
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
                  <div className="flex flex-row justify-between w-full">
                    <div className="flex items-center space-x-4">
                      {/* Loader for the current file */}
                      {loading === file.id && (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-600"></div>
                      )}
                      {/* Dropdown for Public/Private selection */}
                      <select
                        className="px-2 py-1 border border-gray-300 rounded-md text-red-600 bg-white hover:bg-red-100 focus:ring-2 focus:ring-red-600 outline-none"
                        value={file.visibility || "PRIVATE"}
                        onChange={(e) =>
                          handleFileVisibilityChange(file.id, e.target.value)
                        }
                        disabled={loading === file.id}
                      >
                        <option value="PUBLIC">Public</option>
                        <option value="PRIVATE">Private</option>
                      </select>
                    </div>
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
