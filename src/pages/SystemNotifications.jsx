import React, { useEffect, useState } from 'react';
import Table from '../components/Table/Table';
import { FaEye } from 'react-icons/fa';
import ButtonAction from '../components/Buttons/ButtonAction';
import { getNotifications } from '../services/systemNotificationService';
import { useAuth } from '../context/AuthContext';

const theadTextStock = ['# Parte', 'Descripción', 'Stock', 'Nivel'];
const theadTextTransfers = ['Fecha reportada', 'Origen', 'Action'];

export default function SystemNotifications() {
  const { userData } = useAuth();
  const [stockAlerts, setStockAlerts] = useState([]);
  const [transferAlerts, setTransferAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await getNotifications(userData?.locId);
        setStockAlerts(data.lowStock);
        setTransferAlerts(data.incomingTransfers);
        /* const all = await getNotifications(userData.locId);
        const sent = all.transfers.filter(t => t.origenLoc === userData.locId);
        const received = all.transfers.filter(t => t.destinoLoc === userData.locId);
        setStockAlerts(data.lowStock);
        setTransferAlerts({ sent, received }); */
        /* const data = await getNotifications(userData.locId);

        // ✅ Usa las propiedades exactamente como vienen del backend
        setStockAlerts(data.LowStock);
        setTransferAlerts(data.IncomingTransfers); */
      } catch (error) {
        console.error('Error al cargar notificaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userData?.locId) {
      loadNotifications();
    }
  }, [userData]);

  const renderStockRow = (item, index) => (
    <tr key={index} className="border-b h-9 hover:bg-gray-50">
      <td>{item.numberPart}</td>
      <td>{item.descPart}</td>
      <td>{item.quantity}</td>
      <td className={item.level === 'Crítico' ? 'text-red-600 font-bold' : 'text-yellow-600 font-medium'}>
        {item.level}
      </td>
    </tr>
  );

  const renderTransferRow = (item, index) => (
    <tr key={index} className="border-b h-9 hover:bg-gray-50">
      <td>{new Date(item.fecha).toLocaleDateString('es-PE')}</td>
      <td>{item.origen}</td>
      <td>
        <ButtonAction primaryColor="bg-blue-600" hoverColor="hover:bg-blue-700" icon={FaEye} />
      </td>
    </tr>
  );

  return (
    <div className="bg-gray-100 w-full h-dvh p-6 overflow-y-auto">
      <h1 className="text-xl font-bold mb-6">Notificaciones del sistema</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold text-lg mb-3 text-red-600">⚠️ Alerta de Stock Bajo</h2>
          {loading ? (
            <p>Cargando...</p>
          ) : stockAlerts.length > 0 ? (
            <Table theadText={theadTextStock} tbodyData={stockAlerts} renderRow={renderStockRow} />
          ) : (
            <p className="text-gray-500 italic text-sm">No hay alertas de stock bajo.</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold text-lg mb-3 text-orange-600">📦 Transferencias Entrantes</h2>
          {loading ? (
            <p>Cargando...</p>
          ) : transferAlerts.length > 0 ? (
            <Table theadText={theadTextTransfers} tbodyData={transferAlerts} renderRow={renderTransferRow} />
          ) : (
            <p className="text-gray-500 italic text-sm">No hay transferencias pendientes.</p>
          )}
        </div>
      </div>
    </div>
  );
}
