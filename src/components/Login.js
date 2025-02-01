import React, { useState } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './Login.css';

const Login = ({ onLoginSuccess, toggleRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Função de login com Google
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // Realiza o login com o Google
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Verifica se o usuário já existe no Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      // Se o usuário não existir, cria um novo usuário no Firestore
      if (!userSnap.exists()) {
        // Cria um novo usuário no Firestore com as informações do Google
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
          profilePicture: user.photoURL,
          role: 'user', // Definindo o role como 'user', você pode mudar isso para 'admin' se necessário
        });
      }

      // Redireciona para o painel após a autenticação bem-sucedida
      onLoginSuccess(user);
    } catch (err) {
      setError('Erro ao fazer login com Google.');
      console.error('Login with Google failed:', err);
    }
  };

  // Função de login com email e senha
  const handleEmailLogin = async (e) => {
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
          alert('Bem-vindo, admin!');
          onLoginSuccess('admin');
        } else {
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

      {/* Formulário de login por email e senha */}
      <form onSubmit={handleEmailLogin}>
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

      {/* Botão de login com Google */}
      <button onClick={handleGoogleLogin} className="google-login">
        Entrar com Google
      </button>

      <p>
        Não tem conta?{' '}
        <span className="toggle-link" onClick={toggleRegister}>
          Registrar
        </span>
      </p>
    </div>
  );
};

export default Login;