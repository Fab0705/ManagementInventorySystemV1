import React from 'react'

export default function Reports() {
  return (
    <div className="bg-gray-100 w-full h-dvh p-6 overflow-y-auto">
      <h1 className="text-xl font-bold mb-6">Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Reporte de Inventario</h2>
          <p className="text-sm text-gray-600">Resumen del stock total por categoría.</p>
          <button className="mt-2 text-blue-600 hover:underline text-sm">Ver reporte</button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Reporte de Ventas</h2>
          <p className="text-sm text-gray-600">Detalle de ventas realizadas por rango de fechas.</p>
          <button className="mt-2 text-blue-600 hover:underline text-sm">Ver reporte</button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Reporte de Compras</h2>
          <p className="text-sm text-gray-600">Compras realizadas a proveedores.</p>
          <button className="mt-2 text-blue-600 hover:underline text-sm">Ver reporte</button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Reporte de Transferencias</h2>
          <p className="text-sm text-gray-600">Historial de movimientos entre almacenes.</p>
          <button className="mt-2 text-blue-600 hover:underline text-sm">Ver reporte</button>
        </div>
      </div>
    </div>
  )
}
