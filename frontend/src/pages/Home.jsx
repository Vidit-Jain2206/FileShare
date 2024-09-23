import React from "react";
import AuthPage from "../components/Auth";

const Home = ({ setToast }) => {
  return (
    <div className="max-w-screen h-screen flex items-center justify-center bg-diamond bg-[#f8e3e3]">
      <AuthPage setToast={setToast} />
    </div>
  );
};

export default Home;
