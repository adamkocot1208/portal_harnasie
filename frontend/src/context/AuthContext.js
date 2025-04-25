import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Sprawdź czy użytkownik jest zalogowany przy ładowaniu
    const user = getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);
  
  // Wartość, która będzie dostępna dla konsumentów kontekstu
  const value = {
    currentUser,
    setCurrentUser,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'Admin',
    isHarnas: currentUser?.role === 'Harnas',
    isKursant: currentUser?.role === 'Kursant'
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
