const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
  try {
    // Pobierz token z nagłówka
    const token = req.headers.authorization.split(' ')[1]; // Format: Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ message: 'Brak tokenu uwierzytelniającego' });
    }
    
    // Weryfikuj token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Dodaj informacje o użytkowniku do obiektu request
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;
    
    next();
  } catch (error) {
    console.error('Błąd uwierzytelniania:', error);
    return res.status(401).json({ message: 'Nieprawidłowy token' });
  }
};

// Middleware do sprawdzania roli
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({ message: 'Nie jesteś zalogowany' });
    }
    
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ message: 'Brak uprawnień' });
    }
    
    next();
  };
};

module.exports = { auth, checkRole };
