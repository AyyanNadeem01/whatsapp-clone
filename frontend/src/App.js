import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/user-login/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ProtectedRoute, PublicRoute } from "./Protected";
import Homepage from "./components/Homepage";
import Userdetail from "./components/Userdetail";
import Status from "./pages/StatusSection/Status";
import Setting from "./pages/SettingSection/Setting";
import useUserStore from "./store/useUserStore";
import { disconnectSocket, initializeSocket } from "./services/chat.service";

function App() {
  const{user}=useUserStore()

  useEffect(()=>{
    if(user?._id){
      const socket=initializeSocket();
    }

    return ()=>{
      disconnectSocket()
    }
  },[user])
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/user-login" element={<Login />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Homepage />} />
            <Route path="/user-profile" element={<Userdetail />} />
            <Route path="/status" element={<Status />} />
            <Route path="/setting" element={<Setting />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
