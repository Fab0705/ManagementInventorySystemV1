import React, { useEffect, useState } from 'react';
import Button from '../components/Buttons/Button'
import ButtonAction from '../components/Buttons/ButtonAction'
import { BiTransfer } from "react-icons/bi";
import Table from '../components/Table/Table';
import Modal from '../components/Modals/Modal';
import { getTransfers, createTransfer, updateTransferStatus, getTransferById } from '../services/transferService';
import { fetchMatchingParts } from '../services/sparePartService';
import { getAllRegions, getAllLocations } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { FaTrash } from "react-icons/fa";
import SearchBar_Modal from '../components/SearchBar/SearchBar_Modal';
import { span, td, tr } from 'framer-motion/client';
import TableDetails from '../components/Table/TableDetails';

const theadText = ['Origin', 'Destiny', 'Transfer Date', 'Arrival Date', 'Status', 'Action'];
const theadText_sparePart = ['Number Part', 'Description', 'Quantity'];
const theadText_storage = ['Origin Storage - Province', 'Destiny Storage - Province']

export default function Transfers() {
  const [transfers, setTransfers] = useState([]);
  const [regions, setRegions] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [spareParts, setSpareParts] = useState([]);
  const [errors, setErrors] = useState({ locReg: '', spareParts: ''});

  const { userData } = useAuth();

  const handleSparePartChange = (index, field, value) => {
    const updated = [...spareParts];
    updated[index][field] = value;
    setSpareParts(updated);
  };

  const handleCloseModal = () => {
    setModalOpen(false);

    if(isCreateMode)
    {
      setErrors({ locReg: '', spareParts: '' });
      setSelectedRegionId("");
      setSpareParts([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transferData, regionData, locationData] = await Promise.all([
          getTransfers(),
          getAllRegions(),
          getAllLocations()
        ]);

        setTransfers(Array.isArray(transferData) ? transferData : []);
        setLocations(locationData);

        const userLocation = locationData.find(loc => loc.idLoc === userData?.locId);
        const userRegionId = userLocation?.idReg;

        const filteredRegions = regionData.filter(reg => reg.idReg !== userRegionId);
        setRegions(filteredRegions);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedRegionId) {
      const filtered = locations.filter(loc => loc.idReg === selectedRegionId);
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations([]);
    }
  }, [selectedRegionId, locations]);

  const openEditModal = async (transfer) => {
    const data = await getTransferById(transfer.idTransf);
    setSelectedTransfer(data);
    setIsCreateMode(false);
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedTransfer(null);
    setIsCreateMode(true);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const newErrors = {locReg: '', spareParts: ''}
    let isValid = true;

    if (!selectedRegionId) {
      newErrors.locReg = 'Debe seleccionar una región.';
      isValid = false;
    }

    if (spareParts.length < 1) {
      newErrors.spareParts = 'Debe agregar al menos 1 repuesto.';
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) return;

    try {
      if (isCreateMode) {
        const payload = {
          originId: userData?.locId,
          destinyId: filteredLocations[0]?.idLoc,
          statusTransf: 'Pendiente',
          detailTransfers: spareParts
        };

        await createTransfer(payload);
      } else {
        await updateTransferStatus(selectedTransfer.idTransf);
      }

      setModalOpen(false);
      const updatedTransfers = await getTransfers();
      setTransfers(updatedTransfers);
    } catch (error) {
      console.error('Error al enviar la transferencia:', error);
    }
  };

  const renderTransferRow = (item, index) => (
    <tr key={index} className="border-b h-9 hover:bg-gray-50">
      <td>{item.originLocation?.nameSt}</td>
      <td>{item.destinyLocation?.nameSt}</td>
      <td>{new Date(item.dateTransf).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
      <td>
        {item.arrivalDate
          ? new Date(item.arrivalDate).toLocaleString('es-PE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : <span className="text-sm text-gray-400 italic">Aún no llega a su destino</span>
        }
      </td>
      <td>
        <span className={
          item.statusTransf === 'Completada'
            ? 'text-green-600'
            : 'text-yellow-600'
        }>
          {item.statusTransf}
        </span>
      </td>
      <td>
        <ButtonAction
          primaryColor="bg-indigo-600"
          hoverColor="hover:bg-indigo-700"
          icon={BiTransfer}
          onclick={() => openEditModal(item)}
        />
      </td>
    </tr>
  );

  const renderSparePartsRow = (item, index) => (
    <tr key={index} className='border-b h-9 hover:bg-gray-50 text-center'>
      <td>{item.numberPart}</td>
      <td>{item.descPart}</td>
      <td>{item.quantity}</td>
    </tr>
  );

  return (
    <>
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={isCreateMode ? "Nueva Transferencia" : "Detalles de Transferencia"}
      >
        <div className="space-y-3">
          
          {isCreateMode && (
            <>
              <hr />
              <h3 className='font-bold text-center italic mb-1'>Almacen a transferir</h3>
              <div className="flex flex-row gap-3 mb-5">
                <select
                  className="w-1/3 border mt-2 px-3 py-2 rounded"
                  value={selectedRegionId}
                  onChange={(e) => setSelectedRegionId(e.target.value)}
                >
                  <option value="">Selecciona una región</option>
                  {regions.map(region => (
                    <option key={region.idReg} value={region.idReg}>
                      {region.descReg}
                    </option>
                  ))}
                </select>
                <div className="w-2/3 mt-2 px-3 py-2 border rounded bg-gray-50 text-sm text-gray-700">
                  {selectedRegionId
                    ? filteredLocations.length > 0
                      ? filteredLocations.map(loc => (
                          <div key={loc.idLoc}>
                            <strong>{loc.nameSt}</strong> — {loc.descStLoc}
                          </div>
                        ))
                      : "No hay ubicaciones disponibles para esta región"
                    : "Selecciona una región para ver su ubicación"}
                </div>
              </div>
              {errors.locReg && (
                  <p className="text-sm text-red-500 mt-1">{errors.locReg}</p>
                )}
              <hr />
              <h3 className='font-bold text-center italic mb-2'>Repuestos a transferir</h3>
              <SearchBar_Modal
                fetchData={fetchMatchingParts}
                onResultSelect={(item) => {
                  setSpareParts(prev => [...prev, { idSpare: item.idSpare, numPart: item.numberPart, quantity: 1 }]);
                }}
                renderResultItem={(item) => (
                  <div>
                    {item.numberPart} - <span className="text-sm text-gray-500">{item.descPart}</span>
                  </div>
                )}
                placeholder="Buscar número de parte..."
              />

              <div className="mt-4">
                <Table
                  theadText={["N° Parte", "Cantidad", "Acciones"]}
                  tbodyData={spareParts}
                  renderRow={(sp, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">{sp.idSpare} - {sp.numPart}</td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="1"
                          value={sp.quantity}
                          onChange={(e) =>
                            handleSparePartChange(index, 'quantity', parseInt(e.target.value))
                          }
                          className="w-20 border px-2 py-1 rounded"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => {
                            const updated = [...spareParts];
                            updated.splice(index, 1);
                            setSpareParts(updated);
                          }}
                          className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  )}
                />
              </div>
              {errors.spareParts && (
                <p className="text-sm text-red-500 mt-1">{errors.spareParts}</p>
              )}
              <button
                    onClick={handleSubmit}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                  >
                    {isCreateMode ? 'Registrar' : 'Actualizar'}
                  </button>
            </>
          )}
          {!isCreateMode && (
            <>
              <hr />
              <div className="flex flex-row justify-around">
                <span>
                  <p><strong>Día de transferencia:</strong></p>
                  {selectedTransfer?.dateTransf &&
                    new Date(selectedTransfer.dateTransf).toLocaleString('es-PE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                </span>
                <span>
                  <p><strong>Día de llegada:</strong></p>
                  {selectedTransfer?.arrivalDate ?
                    new Date(selectedTransfer.dateTransf).toLocaleString('es-PE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : <span className="text-sm text-gray-400 italic">Aún no llega a su destino</span>}
                </span>
              </div>
              <h3 className='font-bold text-center italic mb-1'>Almacenes involucrados</h3>
              <TableDetails theadText={theadText_storage}>
                <tr className='border-b h-9 hover:bg-gray-50 text-center'>
                  <td>{selectedTransfer?.origin?.nameSt} - {selectedTransfer?.origin?.region}</td>
                  <td>{selectedTransfer?.destiny?.nameSt} - {selectedTransfer?.destiny?.region}</td>
                </tr>
              </TableDetails>
              <h3 className='font-bold text-center italic mb-1'>Repuestos transferidos</h3>
              <TableDetails
                theadText={theadText_sparePart}
                tbodyData={selectedTransfer?.spareParts || []}
                renderRow={renderSparePartsRow}
              />

              <hr />
              
              {selectedTransfer?.statusTransf === "Completada"
                ? <span className="text-sm text-gray-400 italic">La transferencia ha sido completada</span>
                : <button
                    onClick={handleSubmit}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                  >
                    {isCreateMode ? 'Registrar' : 'Actualizar'}
                  </button>
              }
              
            </>
          )}
        </div>
      </Modal>
      <div className="bg-gray-100 w-full h-dvh p-6 overflow-y-auto">
        <h1 className="text-xl font-bold mb-6">Transfers</h1>

        <div className="flex justify-between items-center mb-4">
          <input className="border px-3 py-2 rounded w-1/3" placeholder="Buscar transferencia..." />
          <Button
            children="New Transfer"
            onclick={openCreateModal}
            primaryColor="bg-purple-600"
            hoverColor="hover:bg-purple-700"
          />
        </div>

        <div className="bg-white rounded-xl shadow p-4 overflow-auto">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <Table theadText={theadText} tbodyData={transfers} renderRow={renderTransferRow} />
          )}
        </div>
      </div>
    </>
  );
}
