import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './Profile.css';

function Profile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nif, setNif] = useState('');
  const [image, setImage] = useState(null); // Para armazenar a imagem selecionada
  const [imageUrl, setImageUrl] = useState(''); // Para armazenar a URL da imagem em base64
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
          setImageUrl(data.profilePicture || '/PWA/public/default-profile.jpg'); // Carrega a imagem de perfil
        }
      } catch (error) {
        console.error('Erro ao carregar os dados do perfil:', error);
        setErrorMessage('Erro ao carregar os dados do perfil.');
      }
    };

    fetchProfile();
  }, [userId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      // Converte a imagem para base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!name || !phone || !nif) {
      setErrorMessage('Todos os campos são obrigatórios.');
      return;
    }

    try {
      const docRef = doc(db, 'users', userId);

      // Atualiza o perfil com os dados
      await setDoc(docRef, {
        name,
        phone,
        nif,
        profilePicture: imageUrl || '', // Se houver uma nova imagem, salva-a no Firestore
      }, { merge: true });

      setSuccessMessage('Perfil atualizado com sucesso!');
      setErrorMessage('');
      
      window.location.reload();
      
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setErrorMessage('Erro ao atualizar perfil. Tente novamente.');
    }
  };

  // Função para validar o nome (somente letras e espaços)
  const validateName = (e) => {
    const regex = /^[A-Za-záéíóúãõâêîôûç\s]+$/; // Letras, espaços e acentos
    if (regex.test(e.target.value) || e.target.value === '') {
      setName(e.target.value);
    }
  };

  // Função para validar o telefone (somente números) 
  const validatePhone = (e) => {
    const regex = /^[0-9]{0,9}$/; // Permite até 9 dígitos, incluindo a possibilidade de o campo ser vazio
    if (regex.test(e.target.value)) {
      setPhone(e.target.value);
    }
  };

  // Função para validar o NIF (somente números)
  const validateNif = (e) => {
    const regex = /^[0-9]{0,9}$/; // Permite até 9 dígitos, incluindo a possibilidade de o campo ser vazio
    if (regex.test(e.target.value)) {
      setNif(e.target.value);
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
          onChange={validateName}
          required
        />
        <input
          type="tel"
          placeholder="Número de Telemóvel"
          value={phone}
          onChange={validatePhone}
          required
        />
        <input
          type="text"
          placeholder="NIF"
          value={nif}
          onChange={validateNif}
          required
        />

        <div className="profile-picture-section">
          <h3>Foto de Perfil</h3>
          <img
            src={imageUrl || 'https://via.placeholder.com/150'}
            alt="Profile"
            className="profile-picture"
          />
          <input type="file" onChange={handleFileChange} />
        </div>

        <button type="submit">Salvar Alterações</button>
      </form>
    </div>
  );
}

export default Profile;
