import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getProfile, updateProfile } from '../../services/authService';
import UserActivityLogs from './UserActivityLogs';

const Profile = () => {
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    nickname: '',
    email: '',
    role: '',
    badgeNumber: ''
  });
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        setProfileData({
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          nickname: response.user.nickname || '',
          email: response.user.email,
          role: response.user.role,
          badgeNumber: response.user.badgeNumber || ''
        });
      } catch (err) {
        setError('Nie udało się pobrać danych profilu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const response = await updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        nickname: profileData.nickname
      });
      
      setSuccess('Profil zaktualizowany pomyślnie');
      setEditing(false);
      
      // Aktualizuj dane w kontekście
      setCurrentUser({
        ...currentUser,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        nickname: response.user.nickname
      });
    } catch (err) {
      setError(err.message || 'Wystąpił błąd podczas aktualizacji profilu');
    }
  };
  
  if (loading) {
    return <div className="text-center mt-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Ładowanie...</span>
      </div>
      <p className="mt-2">Ładowanie profilu...</p>
    </div>;
  }
  
  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`} 
                onClick={() => setActiveTab('profile')}
              >
                Twój profil
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'activity' ? 'active' : ''}`} 
                onClick={() => setActiveTab('activity')}
              >
                Historia aktywności
              </button>
            </li>
          </ul>
          
          {activeTab === 'profile' ? (
            <div className="card">
              <div className="card-header">
                <h4>Twój Profil</h4>
              </div>
              <div className="card-body">
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="firstName" className="form-label">Imię</label>
                    <input
                      type="text"
                      className="form-control"
                      id="firstName"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleChange}
                      disabled={!editing}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="lastName" className="form-label">Nazwisko</label>
                    <input
                      type="text"
                      className="form-control"
                      id="lastName"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleChange}
                      disabled={!editing}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="nickname" className="form-label">Pseudonim</label>
                    <input
                      type="text"
                      className="form-control"
                      id="nickname"
                      name="nickname"
                      value={profileData.nickname}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={profileData.email}
                      disabled={true} // Email nie podlega edycji
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="role" className="form-label">Rola</label>
                    <input
                      type="text"
                      className="form-control"
                      id="role"
                      name="role"
                      value={profileData.role}
                      disabled={true} // Rola nie podlega edycji przez użytkownika
                    />
                  </div>
                  
                  {profileData.role === 'Harnas' && (
                    <div className="mb-3">
                      <label htmlFor="badgeNumber" className="form-label">Numer blachy</label>
                      <input
                        type="text"
                        className="form-control"
                        id="badgeNumber"
                        name="badgeNumber"
                        value={profileData.badgeNumber}
                        disabled={true} // Numer blachy nie podlega edycji przez użytkownika
                      />
                    </div>
                  )}
                  
                  <div className="mb-3">
                    {!editing ? (
                      <button 
                        type="button" 
                        className="btn btn-primary" 
                        onClick={() => setEditing(true)}
                      >
                        Edytuj profil
                      </button>
                    ) : (
                      <>
                        <button 
                          type="submit" 
                          className="btn btn-success me-2"
                        >
                          Zapisz zmiany
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => setEditing(false)}
                        >
                          Anuluj
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <UserActivityLogs />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;