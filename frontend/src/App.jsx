import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import { useEffect, useState } from "react";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [toast, setToast] = useState({
    color: "",
    title: "",
    message: "",
  });
  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => {
        setToast({ color: "", title: "", message: "" }); // Clear toast after 2 seconds
      }, 2000); // 2 seconds

      return () => clearTimeout(timer); // Clear the timeout if the component unmounts or toast changes
    }
  }, [toast, setToast]);
  return (
    <div className="w-screen h-screen relative">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home setToast={setToast} />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard setToast={setToast} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      {toast.message && (
        <div
          className="flex flex-col justify-start items-start px-4 text-white py-2  gap-1 absolute top-1/4 right-0 w-[300px] h-auto"
          style={{
            background: toast.color,
          }}
        >
          <h1>{toast.title}</h1>
          <p>{toast.message}</p>
        </div>
      )}
    </div>
  );
}

export default App;
