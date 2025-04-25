import React, { useEffect, useState } from 'react';
import { getUserActivityLogs } from '../../services/activityLogService';

const UserActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Stan paginacji
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  
  useEffect(() => {
    fetchLogs();
  }, [pagination.currentPage]);
  
  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      const response = await getUserActivityLogs({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage
      });
      
      setLogs(response.logs);
      setPagination(response.pagination);
      setError('');
    } catch (err) {
      setError('Nie udało się pobrać logów aktywności');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Obsługa zmiany strony
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({
        ...pagination,
        currentPage: newPage
      });
    }
  };
  
  // Formatowanie daty
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };
  
  // Tłumaczenie nazw akcji na polski
  const translateAction = (action) => {
    const translations = {
      'LOGIN': 'Logowanie',
      'REGISTER': 'Rejestracja',
      'PASSWORD_RESET_REQUEST': 'Żądanie resetowania hasła',
      'PASSWORD_RESET': 'Resetowanie hasła',
      'PROFILE_UPDATE': 'Aktualizacja profilu',
      'ROLE_CHANGE': 'Zmiana roli'
    };
    
    return translations[action] || action;
  };
  
  if (loading && logs.length === 0) {
    return <div className="text-center mt-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Ładowanie...</span>
      </div>
      <p className="mt-2">Ładowanie historii aktywności...</p>
    </div>;
  }
  
  return (
    <div className="container mt-4">
      <h2>Historia Twojej aktywności</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {logs.length > 0 ? (
        <>
          <div className="list-group mb-4">
            {logs.map(log => (
              <div key={log.id} className="list-group-item list-group-item-action">
                <div className="d-flex w-100 justify-content-between">
                  <h5 className="mb-1">
                    <span className={`badge ${
                      log.action === 'LOGIN' ? 'bg-success' : 
                      log.action === 'REGISTER' ? 'bg-primary' : 
                      log.action === 'PASSWORD_RESET' ? 'bg-warning text-dark' : 
                      log.action === 'PROFILE_UPDATE' ? 'bg-info text-dark' : 
                      'bg-secondary'
                    } me-2`}>
                      {translateAction(log.action)}
                    </span>
                  </h5>
                  <small className="text-muted">{formatDate(log.createdAt)}</small>
                </div>
                <p className="mb-1">{log.description}</p>
                <small className="text-muted">
                  IP: {log.ipAddress}
                </small>
              </div>
            ))}
          </div>
          
          {/* Paginacja */}
          {pagination.totalPages > 1 && (
            <nav aria-label="Nawigacja po stronach">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                  >
                    Poprzednia
                  </button>
                </li>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <li 
                    key={page} 
                    className={`page-item ${pagination.currentPage === page ? 'active' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                
                <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                  >
                    Następna
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      ) : (
        <div className="alert alert-info">
          Nie masz jeszcze żadnej historii aktywności.
        </div>
      )}
    </div>
  );
};

export default UserActivityLogs;