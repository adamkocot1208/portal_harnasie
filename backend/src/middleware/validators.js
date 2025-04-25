const { body, validationResult } = require('express-validator');

// Middleware do sprawdzania wyników walidacji
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Walidacje dla rejestracji
const registerValidation = [
  body('firstName')
    .notEmpty().withMessage('Imię jest wymagane')
    .isLength({ min: 2 }).withMessage('Imię musi mieć co najmniej 2 znaki')
    .isAlpha('pl-PL', { ignore: ' -' }).withMessage('Imię może zawierać tylko litery'),
  
  body('lastName')
    .notEmpty().withMessage('Nazwisko jest wymagane')
    .isLength({ min: 2 }).withMessage('Nazwisko musi mieć co najmniej 2 znaki')
    .isAlpha('pl-PL', { ignore: ' -' }).withMessage('Nazwisko może zawierać tylko litery'),
  
  body('email')
    .notEmpty().withMessage('Email jest wymagany')
    .isEmail().withMessage('Podaj poprawny adres email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Hasło jest wymagane')
    .isLength({ min: 6 }).withMessage('Hasło musi mieć co najmniej 6 znaków')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/).withMessage('Hasło musi zawierać co najmniej jedną cyfrę, jedną małą i jedną dużą literę'),
  
  validate
];

// Walidacje dla logowania
const loginValidation = [
  body('email')
    .notEmpty().withMessage('Email jest wymagany')
    .isEmail().withMessage('Podaj poprawny adres email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Hasło jest wymagane'),
  
  validate
];

// Walidacje dla resetowania hasła
const resetPasswordValidation = [
  body('password')
    .notEmpty().withMessage('Hasło jest wymagane')
    .isLength({ min: 6 }).withMessage('Hasło musi mieć co najmniej 6 znaków')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/).withMessage('Hasło musi zawierać co najmniej jedną cyfrę, jedną małą i jedną dużą literę'),
  
  body('confirmPassword')
    .notEmpty().withMessage('Potwierdzenie hasła jest wymagane')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Hasła nie są identyczne');
      }
      return true;
    }),
  
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  resetPasswordValidation
};