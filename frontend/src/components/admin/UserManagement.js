import React, { useEffect, useState } from 'react';
import { changeUserRole, getAllUsers } from '../../services/authService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Stan paginacji
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  
  // Stan wyszukiwania i sortowania
  const [search, setSearch] = useState('');
  const [orderBy, setOrderBy] = useState('id');
  const [order, setOrder] = useState('ASC');
  
  // Pobierz użytkowników przy zmianie parametrów
  useEffect(() => {
    fetchUsers();
  }, [pagination.currentPage, orderBy, order]);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search,
        orderBy,
        order
      });
      
      setUsers(response.users);
      setPagination(response.pagination);
      setError('');
    } catch (err) {
      setError('Nie udało się pobrać listy użytkowników');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRoleChange = async (userId, newRole) => {
    try {
      await changeUserRole(userId, newRole);
      
      // Aktualizuj listę użytkowników lokalnie
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      setSuccess(`Rola użytkownika została zmieniona na ${newRole}`);
      
      // Ukryj komunikat o sukcesie po 3 sekundach
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError('Nie udało się zmienić roli użytkownika');
      console.error(err);
    }
  };
  
  // Zmiana strony
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({
        ...pagination,
        currentPage: newPage
      });
    }
  };
  
  // Obsługa wyszukiwania
  const handleSearch = (e) => {
    e.preventDefault();
    // Resetuj stronę przy nowym wyszukiwaniu
    setPagination({
      ...pagination,
      currentPage: 1
    });
    // Wykonaj wyszukiwanie
    fetchUsers();
  };
  
  // Obsługa sortowania
  const handleSort = (column) => {
    if (orderBy === column) {
      // Jeśli kliknięto tę samą kolumnę, zmień kierunek sortowania
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      // W przeciwnym razie ustaw nową kolumnę i domyślnie ASC
      setOrderBy(column);
      setOrder('ASC');
    }
  };
  
  // Obsługa zmiany liczby elementów na stronie
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setPagination({
      ...pagination,
      itemsPerPage: newItemsPerPage,
      currentPage: 1 // Reset do pierwszej strony
    });
  };
  
  if (loading && users.length === 0) {
    return <div className="text-center mt-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Ładowanie...</span>
      </div>
      <p className="mt-2">Ładowanie użytkowników...</p>
    </div>;
  }
  
  return (
    <div className="container mt-4">
      <h2>Zarządzanie użytkownikami</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="row mb-3">
        <div className="col-md-6">
          <form onSubmit={handleSearch}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Szukaj użytkownika..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">
                Szukaj
              </button>
            </div>
          </form>
        </div>
        <div className="col-md-3 d-flex align-items-center">
          <label htmlFor="itemsPerPage" className="me-2">Wyników na stronie:</label>
          <select
            id="itemsPerPage"
            className="form-select"
            value={pagination.itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
        <div className="col-md-3 text-end">
          <span>
            Wyświetlanie {users.length} z {pagination.totalItems} użytkowników
          </span>
        </div>
      </div>
      
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-light">
            <tr>
              <th onClick={() => handleSort('id')} style={{cursor: 'pointer'}}>
                ID {orderBy === 'id' && (order === 'ASC' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('firstName')} style={{cursor: 'pointer'}}>
                Imię i Nazwisko {orderBy === 'firstName' && (order === 'ASC' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('email')} style={{cursor: 'pointer'}}>
                Email {orderBy === 'email' && (order === 'ASC' ? '↑' : '↓')}
              </th>
              <th>Pseudonim</th>
              <th onClick={() => handleSort('role')} style={{cursor: 'pointer'}}>
                Rola {orderBy === 'role' && (order === 'ASC' ? '↑' : '↓')}
              </th>
              <th>Nr blachy</th>
              <th onClick={() => handleSort('createdAt')} style={{cursor: 'pointer'}}>
                Data rejestracji {orderBy === 'createdAt' && (order === 'ASC' ? '↑' : '↓')}
              </th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.nickname || '-'}</td>
                  <td>
                    <span className={`badge ${
                      user.role === 'Admin' ? 'bg-danger' : 
                      user.role === 'Harnas' ? 'bg-success' : 'bg-primary'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.badgeNumber || '-'}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="dropdown">
                      <button className="btn btn-sm btn-outline-primary dropdown-toggle" type="button" id={`dropdown-${user.id}`} data-bs-toggle="dropdown" aria-expanded="false">
                        Zmień rolę
                      </button>
                      <ul className="dropdown-menu" aria-labelledby={`dropdown-${user.id}`}>
                        <li>
                          <button 
                            className={`dropdown-item ${user.role === 'Admin' ? 'active' : ''}`}
                            onClick={() => handleRoleChange(user.id, 'Admin')}
                            disabled={user.role === 'Admin'}
                          >
                            Admin
                          </button>
                        </li>
                        <li>
                          <button 
                            className={`dropdown-item ${user.role === 'Harnas' ? 'active' : ''}`}
                            onClick={() => handleRoleChange(user.id, 'Harnas')}
                            disabled={user.role === 'Harnas'}
                          >
                            Harnaś
                          </button>
                        </li>
                        <li>
                          <button 
                            className={`dropdown-item ${user.role === 'Kursant' ? 'active' : ''}`}
                            onClick={() => handleRoleChange(user.id, 'Kursant')}
                            disabled={user.role === 'Kursant'}
                          >
                            Kursant
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">Nie znaleziono użytkowników</td>
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
      <div className="text-center mt-2">
        <small className="text-muted">
          Strona {pagination.currentPage} z {pagination.totalPages}
        </small>
      </div>
    </div>
  );
};

export default UserManagement;