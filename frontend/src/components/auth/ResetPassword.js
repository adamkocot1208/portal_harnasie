import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import { resetPassword } from '../../services/authService';

const ResetPassword = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { token } = useParams();
  const navigate = useNavigate();
  
  // Schema walidacji
  const validationSchema = Yup.object({
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
      await resetPassword(token, {
        password: values.password,
        confirmPassword: values.confirmPassword
      });
      
      setSuccess(true);
      
      // Po 3 sekundach przekieruj do logowania
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Wystąpił błąd podczas resetowania hasła');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">Ustaw nowe hasło</div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              
              {success ? (
                <div className="alert alert-success">
                  <p>Hasło zostało zmienione pomyślnie!</p>
                  <p>Za chwilę zostaniesz przekierowany do strony logowania.</p>
                </div>
              ) : (
                <>
                  <p>Wprowadź nowe hasło dla swojego konta.</p>
                  
                  <Formik
                    initialValues={{
                      password: '',
                      confirmPassword: ''
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ isSubmitting }) => (
                      <Form>
                        <div className="mb-3">
                          <label htmlFor="password" className="form-label">Nowe hasło</label>
                          <Field
                            type="password"
                            className="form-control"
                            id="password"
                            name="password"
                          />
                          <ErrorMessage name="password" component="div" className="text-danger" />
                        </div>
                        
                        <div className="mb-3">
                          <label htmlFor="confirmPassword" className="form-label">Potwierdź nowe hasło</label>
                          <Field
                            type="password"
                            className="form-control"
                            id="confirmPassword"
                            name="confirmPassword"
                          />
                          <ErrorMessage name="confirmPassword" component="div" className="text-danger" />
                        </div>
                        
                        <div className="d-grid gap-2">
                          <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Zapisywanie...' : 'Ustaw nowe hasło'}
                          </button>
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

export default ResetPassword;