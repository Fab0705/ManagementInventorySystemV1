import React from 'react'

export default function Purchases() {
  return (
    <div className="bg-gray-100 w-full h-dvh p-6 overflow-y-auto">
      <h1 className="text-xl font-bold mb-6">Purchases</h1>

      <div className="flex justify-between items-center mb-4">
        <input className="border px-3 py-2 rounded w-1/3" placeholder="Buscar proveedor o compra..." />
        <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">Registrar Compra</button>
      </div>

      <div className="bg-white rounded-xl shadow p-4 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-600 border-b">
            <tr>
              <th>Proveedor</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td>Distribuidora ABC</td>
              <td>02/05/2025</td>
              <td>S/ 1,250.00</td>
              <td><button className="text-blue-600 hover:underline">Ver</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
