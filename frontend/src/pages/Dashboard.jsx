import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [formData, setFormData] = useState({ password: "", email: "" });
  const [loading, setLoading] = useState(null); // Track loading state for each file

  // Dummy files for testing
  const dummyFiles = [
    {
      id: 1,
      name: "Document 1.pdf",
      visibility: "PUBLIC",
      publicUrl: "http://www.google.com",
      fileUrl: "https://www.youtube.com",
    },
    {
      id: 2,
      name: "Image 2.jpg",
      visibility: "PUBLIC",
      publicUrl: "http://www.google.com",
      fileUrl: "https://www.youtube.com",
    },
    {
      id: 3,
      name: "Presentation 3.pptx",
      visibility: "PRIVATE",
      fileUrl: "https://www.youtube.com",
    },
    {
      id: 4,
      name: "Spreadsheet 4.xlsx",
      visibility: "PRIVATE",
      fileUrl: "https://www.youtube.com",
    },
    {
      id: 5,
      name: "Report 5.docx",
      visibility: "PRIVATE",
      fileUrl: "https://www.youtube.com",
    },
  ];

  useEffect(() => {
    // Simulate fetching files from the backend
    setFiles(dummyFiles);
  }, []);

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

  // Function to handle the change in file privacy visibility
  const handleFilevisibilityChange = async (fileId, newvisibility) => {
    setLoading(fileId); // Show loader for this file
    try {
      // Simulate an API request
      console.log(
        `Sending API request for file ID: ${fileId}, new visibility: ${newvisibility}`
      );
      const response = await new Promise((resolve) =>
        setTimeout(resolve, 2000)
      ); // Simulate a 2-second API request
      // Update file visibility after successful request

      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.id === fileId
            ? {
                ...file,
                visibility: newvisibility,
                publicUrl: newvisibility === "PUBLIC" ? response.publicURL : "",
              }
            : file
        )
      );
    } catch (error) {
      console.error("Error updating file visibility:", error);
    } finally {
      setLoading(null); // Hide loader after request is completed
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
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
            </div>
          )}
        </div>
      </nav>

      {/* File Section */}
      <div className="flex-grow flex flex-col items-center p-4">
        <h2 className="text-2xl text-red-600 mb-4">My Files</h2>
        <div className="w-full max-w-3xl bg-gray-100 rounded-lg shadow-lg p-4 overflow-y-auto h-96">
          <div className="space-y-2">
            {files.length > 0 ? (
              files.map((file) => (
                <div
                  key={file.id}
                  className="p-2 border-b border-gray-300 grid grid-cols-2 place-items-start
                  "
                >
                  <Link
                    to={file.fileUrl}
                    className="hover:underline hover:text-blue-500"
                  >
                    {file.name}
                  </Link>
                  <div className="flex flex-row justify-between w-full">
                    {file.visibility === "PUBLIC" ? (
                      <Link
                        target="_blank"
                        to={file.publicUrl}
                        className="hover:underline text-blue-400"
                      >
                        Public Link
                      </Link>
                    ) : (
                      <a></a>
                    )}
                    <div className="flex items-center space-x-4">
                      {/* Loader for the current file */}
                      {loading === file.id && (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-600"></div>
                      )}
                      {/* Dropdown for Public/Private selection */}
                      <select
                        className="px-2 py-1 border border-gray-300 rounded-md text-red-600 bg-white hover:bg-red-100 focus:ring-2 focus:ring-red-600 outline-none selection:outline-none"
                        value={file.visibility}
                        onChange={(e) =>
                          handleFilevisibilityChange(file.id, e.target.value)
                        }
                        disabled={loading === file.id} // Disable dropdown while loading
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

      {/* Modal for Change Password and Forgot Password */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-4">
              {modalType === "change-password"
                ? "Change Password"
                : "Forgot Password"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {modalType === "change-password" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-800">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </>
              )}
              {modalType === "forgot-password" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-800">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="text-gray-600 hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 text-white rounded-md px-4 py-2"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
