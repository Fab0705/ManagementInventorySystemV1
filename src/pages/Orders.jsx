import React, { useEffect, useState } from 'react';
import Button from '../components/Buttons/Button'
import ButtonAction from '../components/Buttons/ButtonAction';
import { FaEye } from "react-icons/fa";
import Table from '../components/Table/Table';
import { getOrders } from '../services/orderService';

const theadText = ['WO', 'Description', 'Date', 'Status', 'Action'];

const renderOrderRow = (item, index) => (
  <tr key={index} className="border-b h-9 hover:bg-gray-50">
    <td>{item.workOrd}</td>
    <td>{item.descOrd}</td>
    <td>{new Date(item.dateOrd).toLocaleString('es-PE', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    })}</td>
    <td>
      <span className={
        item.statusOrd === 'Pendiente' ? 'text-yellow-600' :
        item.statusOrd === 'Entregado' ? 'text-green-600' :
        'text-gray-600'
      }>
        {item.statusOrd}
      </span>
    </td>
    <td>
      <ButtonAction
        primaryColor={"bg-green-600"}
        hoverColor={"hover:bg-green-700"}
        icon={FaEye}
      />
    </td>
  </tr>
);

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders(); // getOrders ya devuelve response.data
        setOrders(data); // aquí va directo
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="bg-gray-100 w-full h-dvh p-6 overflow-y-auto">
      <h1 className="text-xl font-bold mb-6">Orders</h1>

      <div className="flex justify-between items-center mb-4">
        <input className="border px-3 py-2 rounded w-1/3" placeholder="Buscar orden o cliente..." />
        <Button 
          children={"New Order"} 
          onclick={() => alert("Orden agregado (prueba)")} 
          primaryColor={"bg-green-600"} 
          hoverColor={"hover:bg-green-700"} 
        />
      </div>

      <div className="bg-white rounded-xl shadow p-4 overflow-auto">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <Table theadText={theadText} tbodyData={orders} renderRow={renderOrderRow} />
        )}
      </div>
    </div>
  );
}