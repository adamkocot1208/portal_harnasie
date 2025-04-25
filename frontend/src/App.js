import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';

// Komponenty układu
import Navbar from './components/layout/Navbar';

// Komponenty stron
import AdminPage from './pages/AdminPage';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';

// Komponenty uwierzytelniania
import ForgotPassword from './components/auth/ForgotPassword';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ResetPassword from './components/auth/ResetPassword';
import Profile from './components/user/Profile';

// Komponenty routingu
import PrivateRoute from './components/routing/PrivateRoute';
import RoleRoute from './components/routing/RoleRoute';

// Zaślepki dla stron, które będą zaimplementowane później
const MaterialsPage = () => <div className="container mt-4"><h2>Materiały</h2><p>Ta funkcjonalność zostanie zaimplementowana wkrótce.</p></div>;
const MapsPage = () => <div className="container mt-4"><h2>Mapy</h2><p>Ta funkcjonalność zostanie zaimplementowana wkrótce.</p></div>;
const QuizzesPage = () => <div className="container mt-4"><h2>Testy wiedzy</h2><p>Ta funkcjonalność zostanie zaimplementowana wkrótce.</p></div>;
const ManageMaterialsPage = () => <div className="container mt-4"><h2>Zarządzanie materiałami</h2><p>Ta funkcjonalność zostanie zaimplementowana wkrótce.</p></div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="main-content">
          <Routes>
            {/* Publiczne trasy */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            {/* Chronione trasy - dla wszystkich zalogowanych */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/materials" element={<MaterialsPage />} />
              <Route path="/maps" element={<MapsPage />} />
              <Route path="/quizzes" element={<QuizzesPage />} />
            </Route>
            
            {/* Trasy tylko dla Harnasi i Adminów */}
            <Route element={<RoleRoute allowedRoles={['Admin', 'Harnas']} />}>
              <Route path="/manage-materials" element={<ManageMaterialsPage />} />
            </Route>
            
            {/* Trasy tylko dla Adminów */}
            <Route element={<RoleRoute allowedRoles={['Admin']} />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;