import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Reservas from './components/Reservas';
import Profile from './components/Profile';
import AdminReservations from './components/AdminReservations';
import CreateReservation from './components/CreateReservation';
import { db, auth } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentTab, setCurrentTab] = useState('reservas');
  const [role, setRole] = useState(''); // Armazena o papel do usuário (user ou admin)
  const [showWelcomePopup, setShowWelcomePopup] = useState(false); // Estado para controlar o popup de boas-vindas
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Estado para controlar a exibição do dropdown
  const [profilePic, setProfilePic] = useState('/PWA/public/default-profile.jpg'); // Default profile picture

  // Função chamada após login bem-sucedido
  const handleLoginSuccess = async () => {
    setIsLoggedIn(true);

    // Verifica o role do usuário no Firestore
    const user = auth.currentUser;
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      setRole(userData.role); // Define o papel do usuário (admin ou user)

      // Define a foto de perfil do utilizador
      if (userData.profilePicture) {
        setProfilePic(userData.profilePicture);
      }

      // Se for admin, exibe o popup de boas-vindas
      if (userData.role === 'admin') {
        setShowWelcomePopup(true);
      }
    } else {
      console.log('Usuário não encontrado no Firestore');
    }
  };

  const handleRegisterSuccess = () => {
    setIsRegistering(false);
    alert('Conta criada com sucesso! Podes iniciar sessão agora.');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setRole('');
    setShowWelcomePopup(false); // Fecha o popup ao fazer logout
    setProfilePic('/default-profile.jpg'); // Reset profile picture
  };

  const toggleRegister = () => {
    setIsRegistering(!isRegistering);
  };

  const switchTab = (tab) => {
    setCurrentTab(tab);
  };

  const closeWelcomePopup = () => {
    setShowWelcomePopup(false); // Fecha o popup de boas-vindas
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen); // Alterna o estado do dropdown
  };

  // Callback to update profile picture
  const handleProfilePictureChange = (newProfilePic) => {
    setProfilePic(newProfilePic);
  };

  return (
    <div className="App">
      {isLoggedIn ? (
        <div>
          <nav className="navbar">
            <div className="nav-links">
              <a onClick={() => switchTab('reservas')}>Reservas</a>

              {/* Substituir o texto "Perfil" pela imagem do perfil */}
              <img
                src={profilePic}
                alt="Perfil"
                className="profile-icon"
                onClick={() => switchTab('perfil')}
              />
            </div>

            {/* Menu suspenso de Admin */}
            {role === 'admin' && (
              <div className={`dropdown ${isDropdownOpen ? 'open' : ''}`}>
                <button onClick={toggleDropdown}>Admin</button>
                <div className="dropdown-content">
                  <a onClick={() => switchTab('admin-reservations')}>Todas as Reservas</a>
                  <a onClick={() => switchTab('create-reservation')}>Criar Reserva</a>
                </div>
              </div>
            )}

            <div className="user-options">
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
          </nav>

          <div className="title">Reservas da Pizzaria</div>

          <div className="main-container">
            {currentTab === 'reservas' ? (
              <Reservas />
            ) : currentTab === 'perfil' ? (
              <Profile onProfilePictureChange={handleProfilePictureChange} />
            ) : currentTab === 'admin-reservations' ? (
              <AdminReservations />
            ) : currentTab === 'create-reservation' ? (
              <CreateReservation />
            ) : null}
          </div>
        </div>
      ) : isRegistering ? (
        <Register onRegisterSuccess={handleRegisterSuccess} toggleLogin={toggleRegister} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} toggleRegister={toggleRegister} />
      )}

      {/* Popup de boas-vindas */}
      {showWelcomePopup && role === 'admin' && (
        <div className="welcome-popup">
          <div className="popup-content">
            <h2>Bem-vindo, Admin!</h2>
            <p>Você tem acesso completo ao sistema.</p>
            <button onClick={closeWelcomePopup}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;