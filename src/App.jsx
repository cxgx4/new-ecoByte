import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import KolkataDashboard from "./pages/KolkataDashboard";
import AlertSettings from "./pages/AlertSettings";
import SystemStatus from "./pages/SystemStatus";

import Landing from "./pages/Landing";

function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<KolkataDashboard />} />
          <Route path="/alerts" element={<AlertSettings />} />
          <Route path="/system" element={<SystemStatus />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}

export default App;