import React, { useEffect, useState } from 'react';
import { getActivityLogs } from '../../services/activityLogService';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Stan paginacji
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 25
  });
  
  // Stan filtrowania
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    startDate: '',
    endDate: ''
  });
  
  // Dostępne akcje do filtrowania
  const availableActions = [
    'LOGIN',
    'REGISTER',
    'PASSWORD_RESET_REQUEST',
    'PASSWORD_RESET',
    'PROFILE_UPDATE',
    'ROLE_CHANGE'
  ];
  
  useEffect(() => {
    fetchLogs();
  }, [pagination.currentPage]);
  
  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      // Przygotuj parametry zapytania
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters
      };
      
      // Usuń puste filtry
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });
      
      const response = await getActivityLogs(params);
      
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
  
  // Obsługa zmiany filtrów
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  // Aplikowanie filtrów
  const applyFilters = (e) => {
    e.preventDefault();
    setPagination({
      ...pagination,
      currentPage: 1 // Reset do pierwszej strony
    });
    fetchLogs();
  };
  
  // Resetowanie filtrów
  const resetFilters = () => {
    setFilters({
      userId: '',
      action: '',
      startDate: '',
      endDate: ''
    });
    
    setPagination({
      ...pagination,
      currentPage: 1
    });
    
    // Pobierz logi bez filtrów
    setTimeout(fetchLogs, 0);
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
  
  if (loading && logs.length === 0) {
    return <div className="text-center mt-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Ładowanie...</span>
      </div>
      <p className="mt-2">Ładowanie logów aktywności...</p>
    </div>;
  }
  
  return (
    <div className="container mt-4">
      <h2>Logi aktywności użytkowników</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {/* Filtry */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Filtry</h5>
        </div>
        <div className="card-body">
          <form onSubmit={applyFilters}>
            <div className="row">
              <div className="col-md-3 mb-3">
                <label htmlFor="userId" className="form-label">ID Użytkownika</label>
                <input
                  type="number"
                  className="form-control"
                  id="userId"
                  name="userId"
                  value={filters.userId}
                  onChange={handleFilterChange}
                  min="1"
                />
              </div>
              
              <div className="col-md-3 mb-3">
                <label htmlFor="action" className="form-label">Akcja</label>
                <select
                  className="form-select"
                  id="action"
                  name="action"
                  value={filters.action}
                  onChange={handleFilterChange}
                >
                  <option value="">Wszystkie akcje</option>
                  {availableActions.map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-3 mb-3">
                <label htmlFor="startDate" className="form-label">Data od</label>
                <input
                  type="date"
                  className="form-control"
                  id="startDate"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </div>
              
              <div className="col-md-3 mb-3">
                <label htmlFor="endDate" className="form-label">Data do</label>
                <input
                  type="date"
                  className="form-control"
                  id="endDate"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
            
            <div className="d-flex justify-content-end">
              <button type="button" className="btn btn-secondary me-2" onClick={resetFilters}>
                Resetuj filtry
              </button>
              <button type="submit" className="btn btn-primary">
                Filtruj
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Tabela logów */}
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Użytkownik</th>
              <th>Akcja</th>
              <th>Opis</th>
              <th>Adres IP</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map(log => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>
                    {log.user ? (
                      <>
                        <strong>{log.user.name}</strong><br />
                        <small>{log.user.email}</small>
                      </>
                    ) : (
                      <span className="text-muted">Brak użytkownika</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${
                      log.action === 'LOGIN' ? 'bg-success' : 
                      log.action === 'REGISTER' ? 'bg-primary' : 
                      log.action === 'PASSWORD_RESET' ? 'bg-warning text-dark' : 
                      log.action === 'ROLE_CHANGE' ? 'bg-danger' : 
                      'bg-secondary'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.description}</td>
                  <td><small>{log.ipAddress}</small></td>
                  <td><small>{formatDate(log.createdAt)}</small></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">Nie znaleziono logów aktywności</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Paginacja */}
      {pagination.totalPages > 1 && (
        <nav aria-label="Nawigacja po stronach">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage === 1}
              >
                «
              </button>
            </li>
            <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                Poprzednia
              </button>
            </li>
            
            {/* Wyświetlanie numerów stron */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              // Pokaż tylko kilka stron wokół aktualnej
              .filter(page => 
                page === 1 || 
                page === pagination.totalPages || 
                Math.abs(page - pagination.currentPage) <= 1
              )
              .map((page, index, array) => {
                // Dodaj wielokropek, jeśli są pomijane numery stron
                const previousPage = array[index - 1];
                const showEllipsis = previousPage && previousPage !== page - 1;
                
                return (
                  <React.Fragment key={page}>
                    {showEllipsis && (
                      <li className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    )}
                    <li className={`page-item ${pagination.currentPage === page ? 'active' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    </li>
                  </React.Fragment>
                );
              })}
            
            <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Następna
              </button>
            </li>
            <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                »
              </button>
            </li>
          </ul>
        </nav>
      )}
      
      {/* Informacja o paginacji */}
      <div className="text-center mt-2 mb-4">
        <small className="text-muted">
          Strona {pagination.currentPage} z {pagination.totalPages}, 
          Łącznie rekordów: {pagination.totalItems}
        </small>
      </div>
    </div>
  );
};

export default ActivityLogs;