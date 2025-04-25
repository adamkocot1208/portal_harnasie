import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="container mt-4">
      <div className="jumbotron">
        <h1 className="display-4">Portal Przewodników Beskidzkich</h1>
        <p className="lead">
          Witaj w aplikacji do nauki na przewodnika beskidzkiego!
        </p>
        <hr className="my-4" />
        <p>
          Portal ten służy jako pomoc naukowa dla uczestników kursu na przewodnika beskidzkiego.
          Znajdziesz tu materiały, interaktywne mapy i testy wiedzy.
        </p>
        <p className="lead">
          <Link to="/register" className="btn btn-primary me-2">
            Zarejestruj się
          </Link>
          <Link to="/login" className="btn btn-secondary">
            Zaloguj się
          </Link>
        </p>
      </div>
      
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Materiały edukacyjne</h5>
              <p className="card-text">
                Dostęp do materiałów przygotowanych przez Harnasi.
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Interaktywne mapy</h5>
              <p className="card-text">
                Eksploruj Beskidy dzięki mapom z warstwami informacyjnymi.
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Sprawdź swoją wiedzę</h5>
              <p className="card-text">
                Testy i quizy sprawdzające Twoją wiedzę o Beskidach.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
