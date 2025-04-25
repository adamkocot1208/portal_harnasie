import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { forgotPassword } from '../../services/authService';

const ForgotPassword = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Schema walidacji
  const validationSchema = Yup.object({
    email: Yup.string()
      .required('Email jest wymagany')
      .email('Podaj poprawny adres email')
  });
  
  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');
    
    try {
      await forgotPassword(values.email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Wystąpił błąd podczas wysyłania emaila resetującego hasło');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">Resetowanie hasła</div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              
              {success ? (
                <div className="alert alert-success">
                  <p>Email z instrukcjami resetowania hasła został wysłany na podany adres.</p>
                  <p>Sprawdź swoją skrzynkę odbiorczą i postępuj zgodnie z instrukcjami.</p>
                  <div className="mt-3">
                    <Link to="/login" className="btn btn-primary">Wróć do logowania</Link>
                  </div>
                </div>
              ) : (
                <>
                  <p>Podaj adres email, na który zostanie wysłany link do resetowania hasła.</p>
                  
                  <Formik
                    initialValues={{ email: '' }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ isSubmitting }) => (
                      <Form>
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
                        
                        <div className="d-grid gap-2">
                          <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Wysyłanie...' : 'Wyślij link resetujący'}
                          </button>
                        </div>
                        
                        <div className="text-center mt-3">
                          <Link to="/login">Wróć do logowania</Link>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;