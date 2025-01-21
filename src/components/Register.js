import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import './Register.css';

const Register = ({ onRegisterSuccess, toggleLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !nome) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      // Criando o usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verifica se a coleção 'users' está vazia
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const isFirstUser = usersSnapshot.empty; // Verifica se é o primeiro usuário

      // Atribuindo a role: se for o primeiro, será admin, caso contrário será user
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        nome,
        email,
        role: isFirstUser ? 'admin' : 'user', // Role: admin para o primeiro, user para os outros
      });

      // Chamando a função que será executada após sucesso no registro
      onRegisterSuccess();
    } catch (err) {
      setError('Erro ao criar a conta. Tente novamente.');
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className="register-container">
      <h2>Criar Conta</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
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
        <button type="submit">Criar Conta</button>
      </form>
      <p>
        Já tem uma conta?{' '}
        <span className="toggle-link" onClick={toggleLogin}>
          Fazer Login
        </span>
      </p>
    </div>
  );
};

export default Register;
