const { getActivityLogs } = require('../services/logService');
const User = require('../models/User');

// Pobierz wszystkie logi aktywności (tylko dla admina)
exports.getActivityLogs = async (req, res) => {
  try {
    // Sprawdź czy użytkownik jest adminem
    if (req.userRole !== 'Admin') {
      return res.status(403).json({ message: 'Brak dostępu' });
    }
    
    // Parametry paginacji
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    
    // Filtry
    const filters = {};
    
    // Filtrowanie po userId
    if (req.query.userId) {
      filters.userId = req.query.userId;
    }
    
    // Filtrowanie po action
    if (req.query.action) {
      filters.action = req.query.action;
    }
    
    // Filtrowanie po dacie
    if (req.query.startDate) {
      const startDate = new Date(req.query.startDate);
      filters.createdAt = { ...filters.createdAt, $gte: startDate };
    }
    
    if (req.query.endDate) {
      const endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999); // Koniec dnia
      filters.createdAt = { ...filters.createdAt, $lte: endDate };
    }
    
    const result = await getActivityLogs(filters, page, limit);
    
    // Pobierz informacje o użytkownikach dla logów
    const userIds = result.logs
      .filter(log => log.userId)
      .map(log => log.userId);
    
    const uniqueUserIds = [...new Set(userIds)];
    
    const users = uniqueUserIds.length > 0 
      ? await User.findAll({
          where: { id: uniqueUserIds },
          attributes: ['id', 'firstName', 'lastName', 'email']
        })
      : [];
    
    // Dodaj informacje o użytkowniku do każdego logu
    const logsWithUserInfo = result.logs.map(log => {
      const user = users.find(u => u.id === log.userId);
      return {
        ...log.toJSON(),
        user: user ? {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email
        } : null
      };
    });
    
    res.status(200).json({
      logs: logsWithUserInfo,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Błąd przy pobieraniu logów aktywności:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas pobierania logów aktywności', error: error.message });
  }
};

// Pobierz logi aktywności dla zalogowanego użytkownika
exports.getUserActivityLogs = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Parametry paginacji
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    
    const result = await getActivityLogs({ userId }, page, limit);
    
    res.status(200).json({
      logs: result.logs,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Błąd przy pobieraniu logów aktywności użytkownika:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas pobierania logów aktywności użytkownika', error: error.message });
  }
};