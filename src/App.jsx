import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import KolkataDashboard from "./pages/KolkataDashboard";
import AirIQPage from "./pages/AirIQPage";
import AlertSettings from "./pages/AlertSettings";
import SystemStatus from "./pages/SystemStatus";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";

import Landing from "./pages/Landing";

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/map" element={<KolkataDashboard />} />
              <Route path="/forecast" element={<AirIQPage />} />
              <Route path="/alerts" element={<AlertSettings />} />
              <Route path="/system" element={<SystemStatus />} />
            </Route>
          </Route>
        </Routes>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;