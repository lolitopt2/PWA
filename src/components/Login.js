import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import './Login.css';

const Login = ({ onLoginSuccess, toggleRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Realiza o login com Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verifica o role do usuário no Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.role === 'admin') {
          // Se for admin, redireciona para a página de admin
          alert('Bem-vindo, admin!');
          onLoginSuccess('admin');
        } else {
          // Se for user normal, vai para o painel de usuário
          alert('Bem-vindo, usuário!');
          onLoginSuccess('user');
        }
      } else {
        setError('Usuário não encontrado!');
      }
    } catch (err) {
      setError('Erro ao fazer login. Verifique suas credenciais.');
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
      </form>
      <p>
        Não tem conta?{' '}
        <span className="toggle-link" onClick={toggleRegister}>
          Registrar
        </span>
      </p>
    </div>
  );
};

export default Login;
