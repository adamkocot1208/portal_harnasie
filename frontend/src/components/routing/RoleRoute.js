import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

// Komponent chroniący trasy w zależności od roli użytkownika
const RoleRoute = ({ allowedRoles }) => {
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();
  
  // Jeśli nie jest zalogowany, przekieruj do logowania
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} />;
  }
  
  // Jeśli jest zalogowany, ale nie ma odpowiedniej roli, przekieruj do dashboard
  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  // Jeśli wszystko OK, renderuj chronioną zawartość
  return <Outlet />;
};

export default RoleRoute;
