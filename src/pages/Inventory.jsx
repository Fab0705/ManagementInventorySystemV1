import React from 'react'

export default function Inventory() {
  return (
    <div className="bg-gray-100 w-full h-dvh p-6 overflow-y-auto">
      <h1 className="text-xl font-bold mb-6">Inventory</h1>

      <div className="flex justify-between items-center mb-4">
        <input className="border px-3 py-2 rounded w-1/3" placeholder="Buscar producto..." />
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Agregar Producto</button>
      </div>

      <div className="bg-white rounded-xl shadow p-4 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-600 border-b">
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Stock</th>
              <th>Ubicación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td>Monitor Samsung</td>
              <td>Electrónica</td>
              <td>15</td>
              <td>Almacén Lima</td>
              <td><button className="text-blue-600 hover:underline">Editar</button></td>
            </tr>
            {/* Más filas... */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
