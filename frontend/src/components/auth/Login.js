import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { AuthContext } from '../../context/AuthContext';
import { login, resendVerification } from '../../services/authService';

const Login = () => {
  const [error, setError] = useState('');
  const [needVerification, setNeedVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  
  const { setCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Sprawdź czy w URL jest parametr verified=true
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('verified') === 'true') {
      setVerificationComplete(true);
    }
  }, [location]);
  
  // Schema walidacji
  const validationSchema = Yup.object({
    email: Yup.string()
      .required('Email jest wymagany')
      .email('Podaj poprawny adres email'),
    
    password: Yup.string()
      .required('Hasło jest wymagane'),
    
    rememberMe: Yup.boolean()
  });
  
  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');
    setNeedVerification(false);
    
    try {
      const response = await login({
        email: values.email, 
        password: values.password,
        rememberMe: values.rememberMe
      });
      
      setCurrentUser(response.user);
      navigate('/dashboard');
    } catch (err) {
      if (err.needVerification) {
        setNeedVerification(true);
        setVerificationEmail(values.email);
      } else {
        setError(err.message || 'Wystąpił błąd podczas logowania');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleResendVerification = async () => {
    try {
      setResendingVerification(true);
      await resendVerification(verificationEmail);
      setVerificationSuccess(true);
    } catch (err) {
      setError(err.message || 'Nie udało się wysłać linku weryfikacyjnego');
    } finally {
      setResendingVerification(false);
    }
  };
  
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">Logowanie</div>
            <div className="card-body">
              {verificationComplete && (
                <div className="alert alert-success">
                  Twój adres email został pomyślnie zweryfikowany. Możesz się teraz zalogować.
                </div>
              )}
              
              {error && <div className="alert alert-danger">{error}</div>}
              
              {needVerification && (
                <div className="alert alert-warning">
                  <p>Adres email nie został jeszcze zweryfikowany. Sprawdź swoją skrzynkę pocztową lub zażądaj ponownego wysłania linku weryfikacyjnego.</p>
                  
                  {verificationSuccess ? (
                    <div className="alert alert-success mt-2">
                      Link weryfikacyjny został ponownie wysłany na Twój adres email.
                    </div>
                  ) : (
                    <button 
                      type="button" 
                      className="btn btn-primary mt-2"
                      onClick={handleResendVerification}
                      disabled={resendingVerification}
                    >
                      {resendingVerification ? 'Wysyłanie...' : 'Wyślij ponownie link weryfikacyjny'}
                    </button>
                  )}
                </div>
              )}
              
              <Formik
                initialValues={{
                  email: '',
                  password: '',
                  rememberMe: false
                }}
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
                    
                    <div className="mb-3 form-check">
                      <Field
                        type="checkbox"
                        className="form-check-input"
                        id="rememberMe"
                        name="rememberMe"
                      />
                      <label className="form-check-label" htmlFor="rememberMe">Zapamiętaj mnie</label>
                    </div>
                    
                    <div className="d-grid gap-2">
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Logowanie...' : 'Zaloguj się'}
                      </button>
                    </div>
                    
                    <div className="text-center mt-3">
                      <a href="/forgot-password">Zapomniałeś hasła?</a>
                    </div>
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

export default Login;