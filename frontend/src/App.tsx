import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CropRecommendation from "./pages/CropRecommendation";
import DiseaseDetection from "./pages/DiseaseDetection";
import AdminDashboard from "./pages/AdminDashboard";
import YieldPrediction from "./pages/YieldPrediction";
import Weather from "./pages/Weather";
import Profile from "./pages/Profile";
import ProduceManagement from "./pages/ProduceManagement";
import FarmAnalysis from "./pages/FarmAnalysis";
import { ProtectedRoute } from "./pages/ProtectedRoute";

import { FarmContextProvider } from "./context/FarmContext";
import { ToastProvider } from "./context/ToastContext";
import { MobileBottomNav } from "./components/MobileBottomNav";

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <FarmContextProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route element={<ProtectedRoute role="user" />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/crop-recommendation" element={<CropRecommendation />} />
              <Route path="/disease-detection" element={<DiseaseDetection />} />
              <Route path="/yield-prediction" element={<YieldPrediction />} />
              <Route path="/farm-analysis" element={<FarmAnalysis />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/irrigation" element={<Weather />} />
              <Route path="/produce" element={<ProduceManagement />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route element={<ProtectedRoute role="admin" />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/farmer-view" element={<Dashboard />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <MobileBottomNav />
        </FarmContextProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
