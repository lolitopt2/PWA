import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, query, where, deleteDoc, doc, updateDoc, addDoc } from 'firebase/firestore';
import './Reservas.css';

const Reservas = () => {
  const [nome, setNome] = useState('');
  const [pessoas, setPessoas] = useState('');
  const [hora, setHora] = useState('');
  const [data, setData] = useState('');
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reservaEditando, setReservaEditando] = useState(null);

  const userId = auth.currentUser?.uid;

  // Função para carregar as reservas
  const carregarReservas = async () => {
    if (!userId) return;

    try {
      const reservasQuery = query(
        collection(db, 'reservas'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(reservasQuery);
      const reservasArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReservas(reservasArray);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
    }
  };

  // Função para verificar se já existem 2 reservas para a mesma hora e data
  const verificarReservas = async (data, hora) => {
    try {
      const reservasQuery = query(
        collection(db, 'reservas'),
        where('data', '==', data),
        where('hora', '==', hora)
      );
      const querySnapshot = await getDocs(reservasQuery);

      if (querySnapshot.size >= 2) {
        return true; // Retorna true se já houver 2 ou mais reservas
      }
      return false; // Se houver menos de 2, retorna false
    } catch (error) {
      console.error('Erro ao verificar reservas:', error);
      return false;
    }
  };

  // Função para adicionar uma nova reserva
  const adicionarReserva = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!nome || !pessoas || !hora || !data) {
        alert('Por favor, preencha todos os campos.');
        setLoading(false);
        return;
      }

      // Verificar se já existem 2 reservas para a mesma hora
      const jaExistemReservas = await verificarReservas(data, hora);
      if (jaExistemReservas) {
        alert('Já existem 2 reservas para este horário. Por favor, escolha outro horário.');
        setLoading(false);
        return;
      }

      await addDoc(collection(db, 'reservas'), {
        nome: nome.trim(),
        pessoas: parseInt(pessoas, 10),
        hora: hora.trim(),
        data,
        userId,
      });

      setNome('');
      setPessoas('');
      setHora('');
      setData('');
      carregarReservas(); // Atualiza a lista de reservas
    } catch (error) {
      console.error('Erro ao adicionar reserva:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para excluir uma reserva
  const excluirReserva = async (id) => {
    try {
      await deleteDoc(doc(db, 'reservas', id));
      alert('Reserva excluída com sucesso!');
      carregarReservas(); // Atualiza a lista de reservas
    } catch (error) {
      console.error('Erro ao excluir reserva:', error);
    }
  };

  // Função para editar uma reserva
  const editarReserva = (reserva) => {
    setReservaEditando(reserva);
    setNome(reserva.nome);
    setPessoas(reserva.pessoas);
    setHora(reserva.hora);
    setData(reserva.data);
  };

  // Função para salvar a edição
  const salvarEdicao = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateDoc(doc(db, 'reservas', reservaEditando.id), {
        nome: nome.trim(),
        pessoas: parseInt(pessoas, 10),
        hora: hora.trim(),
        data,
      });

      setReservaEditando(null); // Reseta o estado de edição
      carregarReservas(); // Atualiza a lista de reservas
    } catch (error) {
      console.error('Erro ao editar reserva:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarReservas();
  }, [userId]);

  return (
    <div className="main-container">
      <h1>Reservas da Pizzaria</h1>

      {/* Formulário de Criação ou Edição de Reserva */}
      <form onSubmit={reservaEditando ? salvarEdicao : adicionarReserva}>
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <select value={pessoas} onChange={(e) => setPessoas(e.target.value)} required>
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
        <button type="submit" disabled={loading}>
          {loading ? 'A processar...' : reservaEditando ? 'Salvar Alterações' : 'Adicionar Reserva'}
        </button>
      </form>

      {/* Tabela de Reservas */}
      <h2>Suas Reservas:</h2>
      {reservas.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Número de Pessoas</th>
              <th>Hora</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva) => (
              <tr key={reserva.id}>
                <td>{reserva.nome}</td>
                <td>{reserva.pessoas}</td>
                <td>{reserva.hora}</td>
                <td>{reserva.data}</td>
                <td>
                  <button onClick={() => excluirReserva(reserva.id)}>❌ Apagar</button>
                  <button onClick={() => editarReserva(reserva)}>✏️ Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-reservas">Não há reservas para exibir.</p>
      )}
    </div>
  );
};

export default Reservas;
