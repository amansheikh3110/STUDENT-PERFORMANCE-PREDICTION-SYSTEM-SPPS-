import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import StudentProfilePage from './pages/StudentProfilePage';
import InterventionsPage from './pages/InterventionsPage';
import PredictionsPage from './pages/PredictionsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute allowedRoles={['admin','teacher','counsellor']}><StudentsPage /></ProtectedRoute>} />
          <Route path="/students/:studentId" element={<ProtectedRoute allowedRoles={['admin','teacher','counsellor']}><StudentProfilePage /></ProtectedRoute>} />
          <Route path="/interventions" element={<ProtectedRoute allowedRoles={['admin','teacher','counsellor']}><InterventionsPage /></ProtectedRoute>} />
          <Route path="/predictions" element={<ProtectedRoute allowedRoles={['admin']}><PredictionsPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
