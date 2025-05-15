import React from 'react'
import Button from '../components/Buttons/Button'
import ButtonAction from '../components/Buttons/ButtonAction'
import { BiTransfer } from "react-icons/bi";
import Table from '../components/Table/Table';

const theadText = ['Origin', 'Destiny', 'Date', 'Status', 'Action'];
const tbodyData = [
  {
    origin: 'Almacén Lima',
    destiny: 'Almacén Huacho',
    date: '03/05/2025',
  },
  {
    origin: 'Almacén Lima',
    destiny: 'Almacén Huacho',
    date: '08/05/2025',
  }
]

const renderTransferRow = (item, index) => (
  <tr key={index} className="border-b h-9 hover:bg-gray-50">
    <td>{item.origin}</td>
    <td>{item.destiny}</td>
    <td>{item.date}</td>
    <td><span className="text-yellow-600">En tránsito</span></td>
    <td><ButtonAction primaryColor={"bg-indigo-600"} hoverColor={"hover:bg-indigo-700"} icon={BiTransfer} /></td>
  </tr>
);

export default function Transfers() {
  return (
    <div className="bg-gray-100 w-full h-dvh p-6 overflow-y-auto">
      <h1 className="text-xl font-bold mb-6">Transfers</h1>

      <div className="flex justify-between items-center mb-4">
        <input className="border px-3 py-2 rounded w-1/3" placeholder="Buscar transferencia..." />
        <Button children={"New Transfer"} onclick={() => alert("Transferencia agregado (prueba)")} primaryColor={"bg-purple-600"} hoverColor={"hover:bg-purple-700"} />
      </div>

      <div className="bg-white rounded-xl shadow p-4 overflow-auto">
        <Table theadText={theadText} tbodyData={tbodyData} renderRow={renderTransferRow} />
      </div>
    </div>
  )
}
