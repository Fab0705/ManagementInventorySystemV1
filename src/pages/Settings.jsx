import React from 'react'
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { userData } = useAuth();

  return (
    <div className="bg-gray-100 w-full h-dvh p-6 overflow-y-auto">
      <h1 className="text-xl font-bold mb-6">Settings</h1>

      <div className="flex flex-row gap-6 mb-6">
        {/* Personalización */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Personalización</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Tema</span>
              <select className="p-1 border rounded">
                <option>Claro</option>
                <option>Oscuro</option>
                <option>Sistema</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <span>Idioma</span>
              <select className="p-1 border rounded">
                <option>Español</option>
                <option>Inglés</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <span>Formato de fecha</span>
              <select className="p-1 border rounded">
                <option>dd/mm/yyyy</option>
                <option>mm/dd/yyyy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cuenta */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Cuenta</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Nombre de usuario</span>
              <span className="text-gray-600">{userData?.username}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Email</span>
              <span className="text-gray-600">{userData?.emails}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Rol</span>
              <span className="text-gray-600">{userData?.roles}</span>
            </div>
            <button className="text-sm text-blue-600 hover:underline">Cambiar contraseña</button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-row gap-6">
        {/* Empresa */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Información de Almacén</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Almacén</span>
              <span className="text-gray-600">{userData?.locName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Región</span>
              <span className="text-gray-600">{userData?.locRegName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Dirección</span>
              <span className="text-gray-600">{userData?.locDir}</span>
            </div>
          </div>
        </div>

        {/* Sistema */}
        <div className="flex-1  p-6 rounded-2xl  mb-6">
          {/* <h2 className="text-lg font-semibold mb-4">Sistema</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Moneda</span>
              <select className="p-1 border rounded">
                <option>Soles (PEN)</option>
                <option>Dólares (USD)</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <span>Stock negativo permitido</span>
              <input type="checkbox" className="w-4 h-4" />
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
