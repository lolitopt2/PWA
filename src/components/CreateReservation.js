import React, { useState } from 'react';
import { db } from '../firebase';
import { addDoc, collection } from 'firebase/firestore';  // Função do Firestore para adicionar reservas

const CreateReservation = () => {
  const [nome, setNome] = useState('');
  const [pessoas, setPessoas] = useState('');
  const [hora, setHora] = useState('');
  const [data, setData] = useState('');

  const handleCreateReservation = async (e) => {
    e.preventDefault();

    try {
      const newReservation = {
        nome,
        pessoas: parseInt(pessoas),
        hora,
        data,
      };

      await addDoc(collection(db, 'reservas'), newReservation);
      alert('Reserva criada com sucesso!');
      setNome('');
      setPessoas('');
      setHora('');
      setData('');
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
    }
  };

  return (
    <div className="create-reservation-container">
      <h2>Criar Nova Reserva</h2>
      <form onSubmit={handleCreateReservation}>
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <select
          value={pessoas}
          onChange={(e) => setPessoas(e.target.value)}
          required
        >
          <option value="">Número de pessoas</option>
          {[...Array(15)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Hora (formato HH:mm)"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          required
        />
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
        />
        <button type="submit">Criar Reserva</button>
      </form>
    </div>
  );
};

export default CreateReservation;
