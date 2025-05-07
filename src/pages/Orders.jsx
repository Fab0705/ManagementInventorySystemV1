import React from 'react'

export default function Orders() {
  return (
    <div className="bg-gray-100 w-full h-dvh p-6 overflow-y-auto">
      <h1 className="text-xl font-bold mb-6">Orders</h1>

      <div className="flex justify-between items-center mb-4">
        <input className="border px-3 py-2 rounded w-1/3" placeholder="Buscar orden o cliente..." />
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Nueva Orden</button>
      </div>

      <div className="bg-white rounded-xl shadow p-4 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-600 border-b">
            <tr>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td>Juan Pérez</td>
              <td>04/05/2025</td>
              <td>S/ 850.00</td>
              <td><span className="text-green-600">Entregado</span></td>
              <td><button className="text-blue-600 hover:underline">Ver</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
