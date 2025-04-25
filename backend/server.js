const express = require('express');
const cors = require('cors');
const sequelize = require('./src/config/db');
require('dotenv').config();

// Import modeli
const User = require('./src/models/User');
const ActivityLog = require('./src/models/ActivityLog');

// Import tras
const userRoutes = require('./src/routes/userRoutes');
const activityLogRoutes = require('./src/routes/activityLogRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Middleware do zapisywania IP
app.use((req, res, next) => {
  req.ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  next();
});

// Podstawowa trasa
app.get('/', (req, res) => {
  res.json({ message: 'API Portalu Harnasi działa!' });
});

// Trasy API
app.use('/api/users', userRoutes);
app.use('/api/activity-logs', activityLogRoutes);

// Synchronizacja z bazą danych
const PORT = process.env.PORT || 5000;
sequelize.sync({ force: true }) // Zmień na false, aby nie resetować bazy przy każdym restarcie
  .then(() => {
    console.log('Baza danych zsynchronizowana');
    app.listen(PORT, () => {
      console.log(`Serwer działa na porcie ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Błąd synchronizacji bazy danych:', err);
  });