const request = require('supertest');
const express = require('express');
const userRoutes = require('../src/routes/userRoutes');
const sequelize = require('../src/config/db');

// Mock dla modelu User
jest.mock('../src/models/User', () => {
  return {
    findOne: jest.fn(),
    create: jest.fn()
  };
});

// Mock dla bcrypt
jest.mock('bcrypt', () => {
  return {
    genSalt: jest.fn().mockResolvedValue('salt'),
    hash: jest.fn().mockResolvedValue('hashedPassword'),
    compare: jest.fn().mockResolvedValue(true)
  };
});

// Mock dla jsonwebtoken
jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn().mockReturnValue('token')
  };
});

// Konfiguracja aplikacji Express do testów
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User API', () => {
  // Test rejestracji
  test('Should register a new user', async () => {
    const User = require('../src/models/User');
    
    // Ustaw mock, aby findOne zwracał null (użytkownik nie istnieje)
    User.findOne.mockResolvedValue(null);
    
    // Ustaw mock, aby create zwracał nowego użytkownika
    User.create.mockResolvedValue({
      id: 1,
      firstName: 'Jan',
      lastName: 'Kowalski',
      email: 'jan@example.com',
      role: 'Kursant'
    });
    
    const response = await request(app)
      .post('/api/users/register')
      .send({
        firstName: 'Jan',
        lastName: 'Kowalski',
        email: 'jan@example.com',
        password: 'password123'
      });
    
    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('Użytkownik został zarejestrowany pomyślnie');
    expect(response.body.user).toBeDefined();
    expect(response.body.user.firstName).toBe('Jan');
  });
});
