import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, query, where, deleteDoc, doc, updateDoc, addDoc } from 'firebase/firestore';
import './Reservas.css';

const Reservas = () => {
  const [nome, setNome] = useState('');
  const [pessoas, setPessoas] = useState('');
  const [hora, setHora] = useState('');
  const [data, setData] = useState('');
  const [mesas, setMesas] = useState('');
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reservaEditando, setReservaEditando] = useState(null);
  const [erro, setErro] = useState('');
  const [showConflictDialog, setShowConflictDialog] = useState(false);

  const userId = auth.currentUser?.uid;

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
      setErro('Erro ao carregar reservas.');
    }
  };

  const verificarReservas = async (data, hora, mesas, excludeId) => {
    try {
      let reservasQuery = query(
        collection(db, 'reservas'),
        where('data', '==', data),
        where('hora', '==', hora),
        where('mesas', '==', parseInt(mesas, 10))
      );

      if (excludeId) {
        reservasQuery = query(reservasQuery, where('__name__', '!=', excludeId));
      }

      const querySnapshot = await getDocs(reservasQuery);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Erro ao verificar reservas:', error);
      return false;
    }
  };

  const adicionarReserva = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    if (!nome || !pessoas || !hora || !data || !mesas) {
      setErro('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }

    const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!horaRegex.test(hora)) {
      setErro('Formato de hora inválido. Use HH:mm (ex: 18:30).');
      setLoading(false);
      return;
    }

    try {
      const hasConflict = await verificarReservas(data, hora, mesas);
      if (hasConflict) {
        setShowConflictDialog(true);
        setLoading(false);
        return;
      }

      await addDoc(collection(db, 'reservas'), {
        nome: nome.trim(),
        pessoas: parseInt(pessoas, 10),
        hora: hora.trim(),
        data,
        userId,
        mesas: parseInt(mesas, 10),
      });

      setNome('');
      setPessoas('');
      setHora('');
      setData('');
      setMesas('');
      carregarReservas();
    } catch (error) {
      console.error('Erro ao adicionar reserva:', error);
      setErro('Erro ao adicionar reserva.');
    } finally {
      setLoading(false);
    }
  };

  const excluirReserva = async (id) => {
    try {
      await deleteDoc(doc(db, 'reservas', id));
      carregarReservas();
    } catch (error) {
      console.error('Erro ao excluir reserva:', error);
      setErro('Erro ao excluir reserva.');
    }
  };

  const editarReserva = (reserva) => {
    setReservaEditando(reserva);
    setNome(reserva.nome);
    setPessoas(reserva.pessoas.toString());
    setHora(reserva.hora);
    setData(reserva.data);
    setMesas(reserva.mesas.toString());
  };

  const salvarEdicao = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    if (!nome || !pessoas || !hora || !data || !mesas) {
      setErro('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }

    const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!horaRegex.test(hora)) {
      setErro('Formato de hora inválido. Use HH:mm (ex: 18:30).');
      setLoading(false);
      return;
    }

    try {
      const hasConflict = await verificarReservas(
        data,
        hora,
        mesas,
        reservaEditando.id
      );

      if (hasConflict) {
        setShowConflictDialog(true);
        setLoading(false);
        return;
      }

      await updateDoc(doc(db, 'reservas', reservaEditando.id), {
        nome: nome.trim(),
        pessoas: parseInt(pessoas, 10),
        hora: hora.trim(),
        data,
        mesas: parseInt(mesas, 10),
      });

      setReservaEditando(null);
      carregarReservas();
    } catch (error) {
      console.error('Erro ao editar reserva:', error);
      setErro('Erro ao editar reserva.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarReservas();
  }, [userId]);

  return (
    <div className="main-container">
      {showConflictDialog && (
        <div className="dialog-overlay">
          <div className="conflict-dialog">
            <h3>Conflito de Reserva</h3>
            <p>Já existe uma reserva para esta mesa no horário selecionado.</p>
            <button onClick={() => setShowConflictDialog(false)}>OK</button>
          </div>
        </div>
      )}

      <h1>Reservas da Pizzaria</h1>
      {erro && <p className="erro">{erro}</p>}

      <form onSubmit={reservaEditando ? salvarEdicao : adicionarReserva}>
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
          placeholder="Hora (HH:mm)"
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
        <select
          value={mesas}
          onChange={(e) => setMesas(e.target.value)}
          required
        >
          <option value="">Número de mesas</option>
          {[...Array(5)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
        <button type="submit" disabled={loading}>
          {loading ? 'A processar...' : reservaEditando ? 'Salvar Alterações' : 'Adicionar Reserva'}
        </button>
      </form>

      <h2>Suas Reservas:</h2>
      {reservas.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Pessoas</th>
              <th>Hora</th>
              <th>Data</th>
              <th>Mesas</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva) => (
              <tr key={reserva.id}>
                <td>{reserva.nome}</td>
                <td>{reserva.pessoas}</td>
                <td>{reserva.hora}</td>
                <td>{new Date(reserva.data).toLocaleDateString('pt-BR')}</td>
                <td>{reserva.mesas}</td>
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