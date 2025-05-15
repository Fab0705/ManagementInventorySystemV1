import React from 'react'
import Button from '../components/Buttons/Button'
import ButtonAction from '../components/Buttons/ButtonAction'
import { FaEye } from "react-icons/fa";
import Table from '../components/Table/Table';

const theadText = ['Supplier', 'Date', 'Total', 'Action'];
const tbodyData = [
  {
    supplier: 'Distribuidora ABC',
    date: '02/05/2025',
    total: '$ 250.00'
  },
  {
    supplier: 'Distribuidora MZH',
    date: '03/04/2025',
    total: '$ 300.00'
  }
]

const renderPurchasesRow = (item, index) => (
  <tr key={index} className="border-b h-9 hover:bg-gray-50">
    <td>{item.supplier}</td>
    <td>{item.date}</td>
    <td>{item.total}</td>
    <td><ButtonAction primaryColor={"bg-orange-600"} hoverColor={"hover:bg-orange-700"} icon={FaEye} /></td>
  </tr>
);

export default function Purchases() {
  return (
    <div className="bg-gray-100 w-full h-dvh p-6 overflow-y-auto">
      <h1 className="text-xl font-bold mb-6">Purchases</h1>

      <div className="flex justify-between items-center mb-4">
        <input className="border px-3 py-2 rounded w-1/3" placeholder="Buscar proveedor o compra..." />
        <Button children={"Register Purchase"} onclick={() => alert("Compra registrada (prueba)")} primaryColor={"bg-orange-600"} hoverColor={"hover:bg-orange-700"} />
      </div>

      <div className="bg-white rounded-xl shadow p-4 overflow-auto">
        <Table theadText={theadText} tbodyData={tbodyData} renderRow={renderPurchasesRow} />
      </div>
    </div>
  )
}
