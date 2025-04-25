import api from './api';

// Rejestracja użytkownika
export const register = async (userData) => {
  try {
    const response = await api.post('/users/register', userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Błąd podczas rejestracji');
  }
};

// Logowanie użytkownika
export const login = async (credentials) => {
  try {
    const response = await api.post('/users/login', credentials);
    
    // Zapisz token i dane użytkownika
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Błąd podczas logowania');
  }
};

// Wylogowanie użytkownika
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Pobranie aktualnego użytkownika
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

// Pobranie profilu użytkownika
export const getProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Błąd podczas pobierania profilu');
  }
};

// Aktualizacja profilu
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Błąd podczas aktualizacji profilu');
  }
};

// Pobierz wszystkich użytkowników (tylko dla admina)
export const getAllUsers = async (params = {}) => {
  try {
    const { page = 1, limit = 10, search = '', orderBy = 'id', order = 'ASC' } = params;
    
    const response = await api.get('/users/all', {
      params: { page, limit, search, orderBy, order }
    });
    
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Błąd podczas pobierania użytkowników');
  }
};

// Zmień rolę użytkownika (tylko dla admina)
export const changeUserRole = async (userId, newRole) => {
  try {
    const response = await api.put('/users/role', { userId, newRole });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Błąd podczas zmiany roli');
  }
};

// Ponowne wysłanie linku weryfikacyjnego
export const resendVerification = async (email) => {
  try {
    const response = await api.post('/users/resend-verification', { email });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Błąd podczas wysyłania linku weryfikacyjnego');
  }
};

// Resetowanie hasła - wysłanie emaila
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/users/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Błąd podczas wysyłania emaila resetującego hasło');
  }
};

// Resetowanie hasła - ustawienie nowego hasła
export const resetPassword = async (token, passwords) => {
  try {
    const response = await api.put(`/users/reset-password/${token}`, passwords);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Błąd podczas resetowania hasła');
  }
};