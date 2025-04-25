import api from './api';

// Pobierz wszystkie logi aktywności (tylko dla admina)
export const getActivityLogs = async (params = {}) => {
  try {
    const response = await api.get('/activity-logs', { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Błąd podczas pobierania logów aktywności');
  }
};

// Pobierz logi aktywności zalogowanego użytkownika
export const getUserActivityLogs = async (params = {}) => {
  try {
    const response = await api.get('/activity-logs/me', { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Błąd podczas pobierania logów aktywności');
  }
};