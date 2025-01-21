import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Reservas from './components/Reservas';
import Profile from './components/Profile';
import AdminReservations from './components/AdminReservations';
import CreateReservation from './components/CreateReservation';
import { db, auth } from './firebase';
import { doc, getDoc } from 'firebase/firestore';  // Funções para buscar dados do Firestore

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentTab, setCurrentTab] = useState('reservas');
  const [role, setRole] = useState('');  // Armazena o papel do usuário (user ou admin)
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);  // Estado para controlar o popup de boas-vindas

  // Função chamada após login bem-sucedido
  const handleLoginSuccess = async () => {
    setIsLoggedIn(true);

    // Verifica o role do usuário no Firestore
    const user = auth.currentUser;
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const userRole = docSnap.data().role;  // Obtém o papel do usuário
      setRole(userRole);  // Define o papel do usuário (admin ou user)

      // Se for admin, exibe o popup de boas-vindas
      if (userRole === 'admin') {
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
    setShowWelcomePopup(false);  // Fecha o popup ao fazer logout
  };

  const toggleRegister = () => {
    setIsRegistering(!isRegistering);
  };

  const switchTab = (tab) => {
    setCurrentTab(tab);
  };

  const closeWelcomePopup = () => {
    setShowWelcomePopup(false);  // Fecha o popup de boas-vindas
  };

  return (
    <div className="App">
      {isLoggedIn ? (
        <div>
          <nav className="navbar">
            <button onClick={() => switchTab('reservas')}>Reservas</button>
            <button onClick={() => switchTab('perfil')}>Perfil</button>

            {/* Exibe a opção de Admin se o papel for admin */}
            {role === 'admin' && (
              <>
                <button onClick={() => switchTab('admin-reservations')}>Todas as Reservas</button>
                <button onClick={() => switchTab('create-reservation')}>Criar Reserva</button>
              </>
            )}

            <button onClick={handleLogout} className="logout-button">Logout</button>
          </nav>

          {currentTab === 'reservas' ? (
            <Reservas />
          ) : currentTab === 'perfil' ? (
            <Profile />
          ) : currentTab === 'admin-reservations' ? (
            <AdminReservations />
          ) : currentTab === 'create-reservation' ? (
            <CreateReservation />
          ) : null}
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
