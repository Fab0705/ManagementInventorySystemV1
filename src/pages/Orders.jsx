import React from 'react'
import Button from '../components/Buttons/Button'
import ButtonAction from '../components/Buttons/ButtonAction';
import { FaEye } from "react-icons/fa";
import Table from '../components/Table/Table';

const theadText = ['Client', 'Date', 'Total', 'Status', 'Action'];
const tbodyData = [
  {
    client: 'Juan Pérez',
    date: '04/05/2025',
    total: '$ 850.00'
  },
  {
    client: 'Laura Smmith',
    date: '09/05/2025',
    total: '$ 1000.00'
  }
]

const renderOrderRow = (item, index) => (
  <tr key={index} className="border-b h-9 hover:bg-gray-50">
    <td>{item.client}</td>
    <td>{item.date}</td>
    <td>{item.total}</td>
    <td><span className="text-green-600">Entregado</span></td>
    <td><ButtonAction primaryColor={"bg-green-600"} hoverColor={"hover:bg-green-700"} icon={FaEye} /></td>
  </tr>
);

export default function Orders() {
  return (
    <div className="bg-gray-100 w-full h-dvh p-6 overflow-y-auto">
      <h1 className="text-xl font-bold mb-6">Orders</h1>

      <div className="flex justify-between items-center mb-4">
        <input className="border px-3 py-2 rounded w-1/3" placeholder="Buscar orden o cliente..." />
        <Button children={"New Order"} onclick={() => alert("Orden agregado (prueba)")} primaryColor={"bg-green-600"} hoverColor={"hover:bg-green-700"} />
      </div>

      <div className="bg-white rounded-xl shadow p-4 overflow-auto">
        <Table theadText={theadText} tbodyData={tbodyData} renderRow={renderOrderRow} />
      </div>
    </div>
  )
}
