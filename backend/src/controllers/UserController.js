const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { sendEmail } = require('../config/email');
require('dotenv').config();

// Rejestracja nowego użytkownika
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, nickname, email, password, role, badgeNumber } = req.body;
    
    // Sprawdź czy użytkownik już istnieje
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Użytkownik z tym adresem email już istnieje' });
    }
    
    // Generuj token weryfikacyjny
    const emailVerificationToken = crypto.randomBytes(20).toString('hex');
    const hashedEmailToken = crypto
      .createHash('sha256')
      .update(emailVerificationToken)
      .digest('hex');
    
    // Tworzenie nowego użytkownika
    const user = await User.create({
      firstName,
      lastName,
      nickname,
      email,
      password, // Sequelize automatycznie zahaszuje hasło dzięki hookowi w modelu
      role: role || 'Kursant', // domyślnie Kursant
      badgeNumber,
      emailVerificationToken: hashedEmailToken,
      emailVerificationExpire: Date.now() + 24 * 60 * 60 * 1000 // token ważny 24h
    });
    
    // Nie zwracaj hasła w odpowiedzi
    user.password = undefined;
    
    // Generuj URL do weryfikacji
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/users/verify-email/${emailVerificationToken}`;
    
    // Treść email
    const html = `
      <h1>Weryfikacja adresu email</h1>
      <p>Dziękujemy za rejestrację w Portalu Przewodników Beskidzkich!</p>
      <p>Aby aktywować swoje konto, kliknij w poniższy link:</p>
      <a href="${verificationUrl}" target="_blank">Weryfikuj adres email</a>
      <p>Link jest ważny przez 24 godziny.</p>
      <p>Jeśli to nie Ty założyłeś konto, zignoruj tę wiadomość.</p>
    `;
    
    try {
      await sendEmail({
        to: user.email,
        subject: 'Portal Harnasi - Weryfikacja adresu email',
        html
      });
      
      res.status(201).json({
        message: 'Użytkownik został zarejestrowany pomyślnie. Sprawdź swoją skrzynkę email, aby aktywować konto.',
        user
      });
    } catch (emailError) {
      // W przypadku błędu wysyłania emaila, usuń użytkownika
      await user.destroy();
      return res.status(500).json({ 
        message: 'Wystąpił błąd podczas wysyłania emaila weryfikacyjnego. Spróbuj ponownie później.',
        error: emailError.message 
      });
    }
  } catch (error) {
    console.error('Błąd przy rejestracji:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas rejestracji', error: error.message });
  }
};

// Logowanie użytkownika
exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    
    // Znajdź użytkownika
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Nieprawidłowy email lub hasło' });
    }
    
    // Sprawdź czy email jest zweryfikowany
    if (!user.isEmailVerified) {
      return res.status(401).json({ 
        message: 'Adres email nie został jeszcze zweryfikowany. Sprawdź swoją skrzynkę pocztową lub zażądaj ponownego wysłania linku weryfikacyjnego.',
        needVerification: true
      });
    }
    
    // Sprawdź hasło
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Nieprawidłowy email lub hasło' });
    }
    
    // Generuj token JWT
    const tokenExpires = rememberMe ? '7d' : '24h'; // 7 dni jeśli "zapamiętaj mnie", w przeciwnym razie 24h
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: tokenExpires }
    );
    
    res.status(200).json({
      message: 'Logowanie pomyślne',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        nickname: user.nickname,
        email: user.email,
        role: user.role,
        badgeNumber: user.badgeNumber
      }
    });
  } catch (error) {
    console.error('Błąd przy logowaniu:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas logowania', error: error.message });
  }
};

// Pobierz dane użytkownika
exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId; // Będzie dostępne z middleware auth
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] } // Nie zwracaj hasła
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error('Błąd przy pobieraniu profilu:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas pobierania profilu', error: error.message });
  }
};

// Aktualizacja danych użytkownika
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId; // Z middleware auth
    const { firstName, lastName, nickname } = req.body;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }
    
    // Aktualizacja danych
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.nickname = nickname || user.nickname;
    
    await user.save();
    
    // Nie zwracaj hasła
    user.password = undefined;
    
    res.status(200).json({
      message: 'Profil zaktualizowany pomyślnie',
      user
    });
  } catch (error) {
    console.error('Błąd przy aktualizacji profilu:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas aktualizacji profilu', error: error.message });
  }
};

// Pobierz listę wszystkich użytkowników (tylko dla admina) z paginacją
exports.getAllUsers = async (req, res) => {
  try {
    // Sprawdź czy użytkownik jest adminem
    if (req.userRole !== 'Admin') {
      return res.status(403).json({ message: 'Brak dostępu' });
    }
    
    // Parametry paginacji
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    
    // Parametry sortowania
    const orderBy = req.query.orderBy || 'id';
    const order = req.query.order || 'ASC';
    
    // Parametr wyszukiwania
    const search = req.query.search || '';
    
    // Warunki wyszukiwania
    const whereCondition = search 
      ? {
          [Op.or]: [
            { firstName: { [Op.iLike]: `%${search}%` } },
            { lastName: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
            { nickname: { [Op.iLike]: `%${search}%` } }
          ]
        }
      : {};
    
    // Wykonaj zapytanie z paginacją
    const { count, rows: users } = await User.findAndCountAll({
      where: whereCondition,
      attributes: { exclude: ['password'] },
      order: [[orderBy, order]],
      limit,
      offset
    });
    
    // Oblicz całkowitą liczbę stron
    const totalPages = Math.ceil(count / limit);
    
    res.status(200).json({
      users,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: page,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Błąd przy pobieraniu użytkowników:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas pobierania listy użytkowników', error: error.message });
  }
};

// Zmiana roli użytkownika (tylko dla admina)
exports.changeUserRole = async (req, res) => {
  try {
    // Sprawdź czy użytkownik jest adminem
    if (req.userRole !== 'Admin') {
      return res.status(403).json({ message: 'Brak dostępu' });
    }
    
    const { userId, newRole } = req.body;
    
    // Sprawdź czy rola jest poprawna
    if (!['Admin', 'Harnas', 'Kursant'].includes(newRole)) {
      return res.status(400).json({ message: 'Nieprawidłowa rola' });
    }
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }
    
    user.role = newRole;
    await user.save();
    
    res.status(200).json({
      message: 'Rola użytkownika została zmieniona',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Błąd przy zmianie roli:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas zmiany roli użytkownika', error: error.message });
  }
};

// Weryfikacja adresu email
exports.verifyEmail = async (req, res) => {
  try {
    // Pobierz token z parametrów i zahashuj go
    const emailVerificationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    
    // Znajdź użytkownika z podanym tokenem i sprawdź czy nie wygasł
    const user = await User.findOne({
      where: {
        emailVerificationToken,
        emailVerificationExpire: { [Op.gt]: Date.now() }
      }
    });
    
    if (!user) {
      return res.status(400).json({ 
        message: 'Nieprawidłowy token weryfikacyjny lub token wygasł. Spróbuj ponownie zarejestrować się.'
      });
    }
    
    // Aktywuj konto użytkownika
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpire = null;
    
    await user.save();
    
    // Przekieruj do strony logowania
    res.redirect(`${req.protocol}://${req.get('host')}/login?verified=true`);
  } catch (error) {
    console.error('Błąd weryfikacji email:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas weryfikacji email', error: error.message });
  }
};

// Ponowne wysłanie linku weryfikacyjnego
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Nie znaleziono użytkownika z tym adresem email' });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Adres email jest już zweryfikowany' });
    }
    
    // Generuj nowy token weryfikacyjny
    const emailVerificationToken = crypto.randomBytes(20).toString('hex');
    const hashedEmailToken = crypto
      .createHash('sha256')
      .update(emailVerificationToken)
      .digest('hex');
    
    // Zapisz token i datę wygaśnięcia
    user.emailVerificationToken = hashedEmailToken;
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24h
    
    await user.save();
    
    // Generuj URL do weryfikacji
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/users/verify-email/${emailVerificationToken}`;
    
    // Treść email
    const html = `
      <h1>Weryfikacja adresu email</h1>
      <p>Oto Twój nowy link do weryfikacji adresu email:</p>
      <a href="${verificationUrl}" target="_blank">Weryfikuj adres email</a>
      <p>Link jest ważny przez 24 godziny.</p>
      <p>Jeśli to nie Ty założyłeś konto, zignoruj tę wiadomość.</p>
    `;
    
    await sendEmail({
      to: user.email,
      subject: 'Portal Harnasi - Nowy link weryfikacyjny',
      html
    });
    
    res.status(200).json({ message: 'Nowy link weryfikacyjny został wysłany na Twój adres email.' });
  } catch (error) {
    console.error('Błąd wysyłania emaila weryfikacyjnego:', error);
    res.status(500).json({ 
      message: 'Wystąpił błąd podczas wysyłania emaila weryfikacyjnego', 
      error: error.message 
    });
  }
};

// Zapomniane hasło - wysłanie tokenu resetowania
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Nie znaleziono użytkownika z tym adresem email' });
    }
    
    // Generuj token resetowania
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Zapisz zahashowany token i czas wygaśnięcia
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Token wygasa po 10 minutach
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    
    await user.save();
    
    // URL z tokenem do resetowania hasła
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    
    // Treść emaila
    const html = `
      <h1>Resetowanie hasła</h1>
      <p>Otrzymujesz tę wiadomość, ponieważ Ty (lub ktoś inny) zażądał zresetowania hasła do konta.</p>
      <p>Kliknij poniższy link, aby zresetować hasło:</p>
      <a href="${resetUrl}" target="_blank">Resetuj hasło</a>
      <p>Jeśli to nie Ty zażądałeś resetowania hasła, zignoruj tę wiadomość.</p>
      <p>Link wygasa po 10 minutach.</p>
    `;
    
    await sendEmail({
      to: user.email,
      subject: 'Portal Harnasi - Resetowanie hasła',
      html
    });
    
    res.status(200).json({ message: 'Email z instrukcjami resetowania hasła został wysłany' });
  } catch (error) {
    console.error('Błąd resetowania hasła:', error);
    
    // W przypadku błędu, wyczyść pola resetowania
    if (user) {
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();
    }
    
    res.status(500).json({ message: 'Nie udało się wysłać emaila z resetowaniem hasła', error: error.message });
  }
};

// Resetowanie hasła
exports.resetPassword = async (req, res) => {
  try {
    // Pobierz token z URL i zahashuj go
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    
    // Znajdź użytkownika z podanym tokenem i sprawdź czy nie wygasł
    const user = await User.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpire: { [Op.gt]: Date.now() }
      }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Nieprawidłowy token resetowania lub token wygasł' });
    }
    
    // Ustaw nowe hasło
    user.password = req.body.password;
    
    // Wyczyść pola resetowania
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    
    await user.save();
    
    res.status(200).json({ message: 'Hasło zostało zmienione pomyślnie' });
  } catch (error) {
    console.error('Błąd przy resetowaniu hasła:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas resetowania hasła', error: error.message });
  }
};