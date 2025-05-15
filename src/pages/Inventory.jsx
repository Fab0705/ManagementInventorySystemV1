import React from 'react'
import Button from '../components/Buttons/Button';
import ButtonAction from '../components/Buttons/ButtonAction';
import { MdModeEditOutline } from "react-icons/md";
import Table from '../components/Table/Table';

const theadText = ['Product', 'Category', 'Stock', 'Price', 'Location', 'Action'];
const tbodyData = [
  {
    name: 'Monitor Samsung',
    category: 'Electronica',
    stock: '15',
    price: '$ 2999.99',
    location: 'Almacen Lima'
  },
  {
    name: 'Mouse Genius',
    category: 'Electronica',
    stock: '30',
    price: '$ 4.99',
    location: 'Almacen Huacho'
  }
]

const renderProductRow = (item, index) => (
  <tr key={index} className="border-b h-9 hover:bg-gray-50">
    <td>{item.name}</td>
    <td>{item.category}</td>
    <td>{item.stock}</td>
    <td>{item.price}</td>
    <td>{item.location}</td>
    <td>
      <ButtonAction
        primaryColor={"bg-blue-600"}
        hoverColor={"hover:bg-blue-700"}
        icon={MdModeEditOutline}
      />
    </td>
  </tr>
);

export default function Inventory() {
  return (
    <div className="bg-gray-100 w-full h-dvh p-6 overflow-y-auto">
      <h1 className="text-xl font-bold mb-6">Inventory</h1>

      <div className="flex justify-between items-center mb-4">
        <input className="border px-3 py-2 rounded w-1/3" placeholder="Buscar producto..." />
        <Button children={"Add Product"} onclick={() => alert("Producto agregado (prueba)")} primaryColor={"bg-blue-600"} hoverColor={"hover:bg-blue-700"} />
      </div>

      <div className="bg-white rounded-xl shadow p-4 overflow-auto">
        <Table theadText={theadText} tbodyData={tbodyData} renderRow={renderProductRow} />
      </div>
    </div>
  );
}
