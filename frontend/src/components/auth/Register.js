import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { register } from '../../services/authService';

const Register = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  
  // Schema walidacji
  const validationSchema = Yup.object({
    firstName: Yup.string()
      .required('Imię jest wymagane')
      .min(2, 'Imię musi mieć co najmniej 2 znaki')
      .matches(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]+$/, 'Imię może zawierać tylko litery'),
    
    lastName: Yup.string()
      .required('Nazwisko jest wymagane')
      .min(2, 'Nazwisko musi mieć co najmniej 2 znaki')
      .matches(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]+$/, 'Nazwisko może zawierać tylko litery'),
    
    email: Yup.string()
      .required('Email jest wymagany')
      .email('Podaj poprawny adres email'),
    
    password: Yup.string()
      .required('Hasło jest wymagane')
      .min(6, 'Hasło musi mieć co najmniej 6 znaków')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Hasło musi zawierać co najmniej jedną dużą literę, jedną małą literę i jedną cyfrę'
      ),
    
    confirmPassword: Yup.string()
      .required('Potwierdzenie hasła jest wymagane')
      .oneOf([Yup.ref('password'), null], 'Hasła muszą być identyczne')
  });
  
  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');
    try {
      // Usuń confirmPassword przed wysłaniem do API
      const { confirmPassword, ...userData } = values;
      
      await register(userData);
      setSuccess(true);
      
      // Po 2 sekundach przekieruj do logowania
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Wystąpił błąd podczas rejestracji');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">Rejestracja</div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">
                Rejestracja zakończona pomyślnie! Za chwilę zostaniesz przekierowany do strony logowania.
              </div>}
              
              <Formik
                initialValues={{
                  firstName: '',
                  lastName: '',
                  nickname: '',
                  email: '',
                  password: '',
                  confirmPassword: ''
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <div className="mb-3">
                      <label htmlFor="firstName" className="form-label">Imię</label>
                      <Field
                        type="text"
                        className="form-control"
                        id="firstName"
                        name="firstName"
                      />
                      <ErrorMessage name="firstName" component="div" className="text-danger" />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="lastName" className="form-label">Nazwisko</label>
                      <Field
                        type="text"
                        className="form-control"
                        id="lastName"
                        name="lastName"
                      />
                      <ErrorMessage name="lastName" component="div" className="text-danger" />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="nickname" className="form-label">Pseudonim (opcjonalnie)</label>
                      <Field
                        type="text"
                        className="form-control"
                        id="nickname"
                        name="nickname"
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
                      <Field
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                      />
                      <ErrorMessage name="email" component="div" className="text-danger" />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">Hasło</label>
                      <Field
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                      />
                      <ErrorMessage name="password" component="div" className="text-danger" />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">Potwierdź hasło</label>
                      <Field
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        name="confirmPassword"
                      />
                      <ErrorMessage name="confirmPassword" component="div" className="text-danger" />
                    </div>
                    
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isSubmitting || success}
                    >
                      {isSubmitting ? 'Rejestracja...' : 'Zarejestruj się'}
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;