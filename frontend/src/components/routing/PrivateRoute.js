import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

// Komponent chroniący trasy przed nieautoryzowanym dostępem
const PrivateRoute = () => {
  const { isAuthenticated } = useContext(AuthContext);
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
