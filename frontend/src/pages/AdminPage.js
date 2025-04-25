import React from 'react';
import ActivityLogs from '../components/admin/ActivityLogs';
import UserManagement from '../components/admin/UserManagement';

const AdminPage = () => {
  return (
    <div className="container mt-4">
      <h1>Panel Administratora</h1>
      <nav>
        <div className="nav nav-tabs" id="nav-tab" role="tablist">
          <button 
            className="nav-link active" 
            id="nav-users-tab" 
            data-bs-toggle="tab" 
            data-bs-target="#nav-users" 
            type="button" 
            role="tab" 
            aria-controls="nav-users" 
            aria-selected="true"
          >
            Użytkownicy
          </button>
          <button 
            className="nav-link" 
            id="nav-logs-tab" 
            data-bs-toggle="tab" 
            data-bs-target="#nav-logs" 
            type="button" 
            role="tab" 
            aria-controls="nav-logs" 
            aria-selected="false"
          >
            Logi aktywności
          </button>
          <button 
            className="nav-link" 
            id="nav-stats-tab" 
            data-bs-toggle="tab" 
            data-bs-target="#nav-stats" 
            type="button" 
            role="tab" 
            aria-controls="nav-stats" 
            aria-selected="false"
          >
            Statystyki
          </button>
        </div>
      </nav>
      <div className="tab-content" id="nav-tabContent">
        <div 
          className="tab-pane fade show active" 
          id="nav-users" 
          role="tabpanel" 
          aria-labelledby="nav-users-tab"
        >
          <UserManagement />
        </div>
        <div 
          className="tab-pane fade" 
          id="nav-logs" 
          role="tabpanel" 
          aria-labelledby="nav-logs-tab"
        >
          <ActivityLogs />
        </div>
        <div 
          className="tab-pane fade" 
          id="nav-stats" 
          role="tabpanel" 
          aria-labelledby="nav-stats-tab"
        >
          <div className="mt-4">
            <h3>Statystyki portalu</h3>
            <p>Ta funkcjonalność zostanie zaimplementowana w przyszłości.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;