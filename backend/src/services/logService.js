const ActivityLog = require('../models/ActivityLog');

// Funkcja do zapisywania logów aktywności
const logActivity = async (data) => {
  try {
    await ActivityLog.create({
      userId: data.userId,
      action: data.action,
      description: data.description,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent
    });
  } catch (error) {
    console.error('Błąd podczas zapisywania logu aktywności:', error);
  }
};

// Funkcja do pobierania logów
const getActivityLogs = async (filters = {}, page = 1, limit = 25) => {
  try {
    const offset = (page - 1) * limit;
    
    const { count, rows } = await ActivityLog.findAndCountAll({
      where: filters,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    return {
      logs: rows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit
      }
    };
  } catch (error) {
    console.error('Błąd podczas pobierania logów aktywności:', error);
    throw error;
  }
};

module.exports = {
  logActivity,
  getActivityLogs
};