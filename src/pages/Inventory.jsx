import React, { useEffect, useState } from 'react';
import Button from '../components/Buttons/Button';
import ButtonAction from '../components/Buttons/ButtonAction';
import { MdModeEditOutline } from "react-icons/md";
import Table from '../components/Table/Table';
import { getAllSpareParts } from '../services/sparePartService';

const theadText = ['Number Part', 'Description', 'Rework', 'Stock Locations', 'Action'];

const renderProductRow = (item, index) => (
  <tr key={index} className="border-b h-9 hover:bg-gray-50">
    <td>{item.numberPart}</td>
    <td>{item.descPart}</td>
    <td>{item.rework ? 'Yes' : 'No'}</td>
    <td>
      {item.sparePartStocks && item.sparePartStocks.length > 0
        ? item.sparePartStocks.map((stock, i) => (
            <div key={i}>
              {stock.idLoc}: {stock.quantity}
            </div>
          ))
        : 'No stock'}
    </td>
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
  const [spareParts, setSpareParts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpareParts = async () => {
      try {
        const data = await getAllSpareParts();
        setSpareParts(Array.isArray(data) ? data : []); // asignar los datos al estado
      } catch (error) {
        console.error('Error fetching spare parts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpareParts();
  }, []);

  return (
    <div className="bg-gray-100 w-full h-dvh p-6 overflow-y-auto">
      <h1 className="text-xl font-bold mb-6">Inventory</h1>

      <div className="flex justify-between items-center mb-4">
        <input className="border px-3 py-2 rounded w-1/3" placeholder="Buscar repuesto..." />
        <Button children={"Add Product"} onclick={() => alert("Producto agregado (prueba)")} primaryColor={"bg-blue-600"} hoverColor={"hover:bg-blue-700"} />
      </div>

      <div className="bg-white rounded-xl shadow p-4 overflow-auto">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <Table theadText={theadText} tbodyData={spareParts} renderRow={renderProductRow} />
        )}
      </div>
    </div>
  );
}
