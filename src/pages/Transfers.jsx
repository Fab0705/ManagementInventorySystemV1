import React from 'react'

export default function Transfers() {
  return (
    <div className="bg-gray-100 w-full h-dvh p-6 overflow-y-auto">
      <h1 className="text-xl font-bold mb-6">Transfers</h1>

      <div className="flex justify-between items-center mb-4">
        <input className="border px-3 py-2 rounded w-1/3" placeholder="Buscar transferencia..." />
        <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Nueva Transferencia</button>
      </div>

      <div className="bg-white rounded-xl shadow p-4 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-600 border-b">
            <tr>
              <th>Origen</th>
              <th>Destino</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td>Almacén Lima</td>
              <td>Arequipa</td>
              <td>03/05/2025</td>
              <td><span className="text-yellow-600">En tránsito</span></td>
              <td><button className="text-blue-600 hover:underline">Detalles</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
