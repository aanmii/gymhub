import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { Navbar } from './components/common/Navbar';
import { PrivateRoute } from './components/common/PrivateRoute';
import { Home } from './components/Home';
import { AuthProvider } from './contexts/AuthContext';
import { Role } from './types';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <Navbar />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />

            {/* Admin only routes */}
            <Route
              path="/admin"
              element={
                <PrivateRoute requiredRole={Role.ADMIN}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;