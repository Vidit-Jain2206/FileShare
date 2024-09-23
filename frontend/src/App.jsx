import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import { useState } from "react";

function App() {
  const [toast, setToast] = useState({
    color: "",
    title: "",
    message: "",
  });
  return (
    <div className="w-screen h-screen relative">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home setToast={setToast} />} />
          <Route
            path="/dashboard"
            element={<Dashboard setToast={setToast} />}
          />
        </Routes>
      </BrowserRouter>
      <div
        className="flex flex-col justify-start items-start px-4 text-white py-2  gap-1 absolute top-1/6 right-0 w-[300px] h-auto"
        style={{
          background: toast.color,
        }}
      >
        <h1>{toast.title}</h1>
        <p>{toast.message}</p>
      </div>
    </div>
  );
}

export default App;
