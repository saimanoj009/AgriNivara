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
import { ProtectedRoute } from "./pages/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute role="user" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/crop-recommendation" element={<CropRecommendation />} />
          <Route path="/disease-detection" element={<DiseaseDetection />} />
          <Route path="/yield-prediction" element={<YieldPrediction />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/farmer-view" element={<Dashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
