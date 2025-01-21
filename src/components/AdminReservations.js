import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import './AdminReservations.css'; // Adicionamos o arquivo CSS para o estilo

const AdminReservations = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar todas as reservas
  const fetchReservations = async () => {
    setLoading(true);
    try {
      const reservasRef = collection(db, 'reservas');
      const q = query(reservasRef, orderBy('data', 'asc')); // Ordena por data crescente
      const querySnapshot = await getDocs(q);
      const reservasList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReservas(reservasList); // Atualiza o estado com as reservas
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para deletar uma reserva
  const deleteReservation = async (id) => {
    try {
      await deleteDoc(doc(db, 'reservas', id)); // Remove a reserva do Firestore
      alert('Reserva eliminada com sucesso!');
      fetchReservations(); // Recarrega as reservas
    } catch (error) {
      console.error('Erro ao eliminar reserva:', error);
    }
  };

  useEffect(() => {
    fetchReservations(); // Busca as reservas quando o componente for carregado
  }, []);

  return (
    <div className="admin-reservations-container">
      <h2>Reservas de Todos os Usuários</h2>
      {loading ? (
        <p>Carregando reservas...</p>
      ) : reservas.length === 0 ? (
        <p>Não há reservas para exibir.</p>
      ) : (
        <table className="table-rounded">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Número de Pessoas</th>
              <th>Data</th>
              <th>Hora</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva) => (
              <tr key={reserva.id}>
                <td>{reserva.nome}</td>
                <td>{reserva.pessoas}</td>
                <td>{new Date(reserva.data).toLocaleDateString()}</td>
                <td>{reserva.hora}</td>
                <td>{reserva.status}</td>
                <td>
                  <button
                    onClick={() => deleteReservation(reserva.id)}
                    className="btn-delete"
                  >
                    ❌ Apagar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminReservations;
