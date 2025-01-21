import React, { useState } from 'react';
import { auth, db } from '../firebase'; 
import { setDoc, doc } from 'firebase/firestore'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';

function CriarAdmin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  console.log("Componente CriarAdmin carregado"); // Adicionando o console.log

  const criarAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: 'admin',
      });

      setSucesso(true);
      setEmail('');
      setSenha('');
    } catch (error) {
      setErro('Erro ao criar admin. Verifique os dados inseridos.');
      console.error('Erro ao criar admin:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <h1>Criar Admin</h1>

      {sucesso && <p className="sucesso">Admin criado com sucesso!</p>}
      {erro && <p className="erro">{erro}</p>}

      <form onSubmit={criarAdmin}>
        <input
          type="email"
          placeholder="Email do Admin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha do Admin"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'A processar...' : 'Criar Admin'}
        </button>
      </form>
    </div>
  );
}

export default CriarAdmin;
