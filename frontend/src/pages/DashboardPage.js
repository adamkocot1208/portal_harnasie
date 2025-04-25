import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { currentUser, isAdmin, isHarnas } = useContext(AuthContext);
  
  return (
    <div className="container mt-4">
      <h2>Witaj, {currentUser.firstName}!</h2>
      <p className="lead">Co chcesz dziś zrobić?</p>
      
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Twój Profil</h5>
              <p className="card-text">
                Przeglądaj i edytuj swoje dane profilowe.
              </p>
              <Link to="/profile" className="btn btn-primary">
                Przejdź do profilu
              </Link>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Materiały</h5>
              <p className="card-text">
                Przeglądaj materiały edukacyjne.
              </p>
              <Link to="/materials" className="btn btn-primary">
                Przeglądaj materiały
              </Link>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Mapy</h5>
              <p className="card-text">
                Eksploruj interaktywne mapy Beskidów.
              </p>
              <Link to="/maps" className="btn btn-primary">
                Przeglądaj mapy
              </Link>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Testy wiedzy</h5>
              <p className="card-text">
                Sprawdź swoją wiedzę o Beskidach.
              </p>
              <Link to="/quizzes" className="btn btn-primary">
                Przejdź do testów
              </Link>
            </div>
          </div>
        </div>
        
        {(isAdmin || isHarnas) && (
          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Zarządzanie materiałami</h5>
                <p className="card-text">
                  Dodawaj i edytuj materiały edukacyjne.
                </p>
                <Link to="/manage-materials" className="btn btn-primary">
                  Zarządzaj materiałami
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {isAdmin && (
          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Panel administratora</h5>
                <p className="card-text">
                  Zarządzaj użytkownikami i uprawnieniami.
                </p>
                <Link to="/admin" className="btn btn-primary">
                  Panel administratora
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
