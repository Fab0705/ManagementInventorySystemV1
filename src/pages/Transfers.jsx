import React, { useEffect, useState } from 'react';
import Button from '../components/Buttons/Button'
import ButtonAction from '../components/Buttons/ButtonAction'
import { BiTransfer } from "react-icons/bi";
import Table from '../components/Table/Table';
import { getTransfers } from '../services/transferService';

const theadText = ['Origin', 'Destiny', 'Transfer Date', 'Arrival Date', 'Status', 'Action'];

const renderTransferRow = (item, index) => (
  <tr key={index} className="border-b h-9 hover:bg-gray-50">
    <td>{item.originLocation?.nameSt}</td>
    <td>{item.destinyLocation?.nameSt}</td>
    <td>{new Date(item.dateTransf).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
    <td>{new Date(item.arrivalDate).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
    <td>
      <span className={
        item.statusTransf === 'Completada'
          ? 'text-green-600'
          : 'text-yellow-600'
      }>
        {item.statusTransf}
      </span>
    </td>
    <td>
      <ButtonAction
        primaryColor="bg-indigo-600"
        hoverColor="hover:bg-indigo-700"
        icon={BiTransfer}
      />
    </td>
  </tr>
);

export default function Transfers() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const data = await getTransfers(); // debe retornar un array directamente
        setTransfers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching transfers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransfers();
  }, []);

  return (
    <div className="bg-gray-100 w-full h-dvh p-6 overflow-y-auto">
      <h1 className="text-xl font-bold mb-6">Transfers</h1>

      <div className="flex justify-between items-center mb-4">
        <input className="border px-3 py-2 rounded w-1/3" placeholder="Buscar transferencia..." />
        <Button
          children="New Transfer"
          onclick={() => alert("Transferencia agregada (prueba)")}
          primaryColor="bg-purple-600"
          hoverColor="hover:bg-purple-700"
        />
      </div>

      <div className="bg-white rounded-xl shadow p-4 overflow-auto">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <Table theadText={theadText} tbodyData={transfers} renderRow={renderTransferRow} />
        )}
      </div>
    </div>
  );
}
