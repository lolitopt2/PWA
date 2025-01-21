import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './Profile.css';

function Profile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nif, setNif] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setEmail(data.email || '');
          setPhone(data.phone || '');
          setNif(data.nif || '');
        }
      } catch (error) {
        console.error('Erro ao carregar os dados do perfil:', error);
        setErrorMessage('Erro ao carregar os dados do perfil.');
      }
    };

    fetchProfile();
  }, [userId]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!name  || !phone || !nif) {
      setErrorMessage('Todos os campos são obrigatórios.');
      return;
    }

    try {
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, { name,  phone, nif }, { merge: true });
      setSuccessMessage('Perfil atualizado com sucesso!');
      setErrorMessage('');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setErrorMessage('Erro ao atualizar perfil. Tente novamente.');
    }
  };

  return (
    <div className="profile-container">
      <h2>Editar Perfil</h2>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form onSubmit={handleUpdateProfile}>
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
       
        <input
          type="tel"
          placeholder="Número de Telemóvel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="NIF"
          value={nif}
          onChange={(e) => setNif(e.target.value)}
          required
        />
        <button type="submit">Salvar Alterações</button>
      </form>
    </div>
  );
}

export default Profile;
