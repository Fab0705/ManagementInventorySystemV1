import React, { useEffect, useState } from 'react';
import Button from '../components/Buttons/Button'
import ButtonAction from '../components/Buttons/ButtonAction'
import { BiTransfer } from "react-icons/bi";
import Table from '../components/Table/Table';
import Modal from '../components/Modals/Modal';
import { getTransfers, createTransfer, updateTransferStatus, getTransferById, getTransfersByOrigin } from '../services/transferService';
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight} from "react-icons/md";
import { sendConditionReport } from '../services/transferService';
import { fetchMatchingParts } from '../services/sparePartService';
import { getAllRegions, getAllLocations } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { FaFileCsv, FaFilePdf, FaPrint, FaFileExcel, FaTrash } from "react-icons/fa";
import SearchBar_Modal from '../components/SearchBar/SearchBar_Modal';
import usePagination from '../hooks/usePagination';
import { span, td, tr } from 'framer-motion/client';
import PageBackground from '../components/UI/Background/PageBackground';
import TableDetails from '../components/Table/TableDetails';

const theadText = ['Almacén de Origen', 'Almacén Destinatario', 'Día de Transferencia', 'Día de llegada', 'Estado', 'Acciones'];
const theadText_sparePart = ['N° de Parte', 'Descripción', 'Cantidad'];
const theadText_storage = ['Almacén de Origen - Provincia', 'Almacén Destinatario - Provincia']

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

  const [transferSearchTerm, setTrasnferSearchTerm] = useState('');
  const [filteredTransfers, setFilteredTransfers] = useState([]);

  const [conditionReport, setConditionReport] = useState({ status: '', notes: '' });
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedFilterRegionId, setSelectedFilterRegionId] = useState('');
  const [selectedOriginLocId, setSelectedOriginLocId] = useState('');

  const { userData } = useAuth();

  const isAdmin = userData?.roles === 'Jefe de Logística';

  const {
    currentData,
    currentPage,
    totalPages,
    rowsPerPage,
    handleChangeRowsPerPage,
    handlePrevPage,
    handleNextPage,
    setCurrentPage
  } = usePagination(filteredTransfers);

  const handleSparePartChange = (index, field, value) => {
    const updated = [...spareParts];
    updated[index][field] = value;
    setSpareParts(updated);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTransfer(null);

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
        const [allTransfers, regionData, locationData] = await Promise.all([
          getTransfers(),
          getAllRegions(),
          getAllLocations()
        ]);

        if (isAdmin) {
          setTransfers(allTransfers);
          setLocations(locationData);
          setRegions(regionData);
        } else
        {
          const filtered = allTransfers.filter(t =>
          t.originLocation.idLoc === userData?.locId || t.destinyLocation.idLoc === userData?.locId
          );

          setTransfers(filtered);
          setLocations(locationData);

          const userLocation = locationData.find(loc => loc.idLoc === userData?.locId);
          const userRegionId = userLocation?.idReg;
          const filteredRegions = regionData.filter(reg => reg.idReg !== userRegionId);

          setRegions(filteredRegions);
        }

        
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userData?.locId || isAdmin) fetchData();
  }, [userData]);

  useEffect(() => {
    if (selectedRegionId) {
      const filtered = locations.filter(loc => loc.idReg === selectedRegionId);
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations([]);
    }
  }, [selectedRegionId, locations]);

  useEffect(() => {
      if (transferSearchTerm.trim() === '') {
        setFilteredTransfers(transfers);
      } else {
        const lower = transferSearchTerm.toLowerCase();
        const filtered = transfers.filter(t =>
          t.destinyLocation.nameSt?.toLowerCase().includes(lower)
        );
        setFilteredTransfers(filtered);
      }
  }, [transferSearchTerm, transfers]);

  useEffect(() => {
    let filtered = [...transfers];

    if (transferSearchTerm.trim()) {
      const lower = transferSearchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.destinyLocation.nameSt?.toLowerCase().includes(lower)
      );
    }
    if (isAdmin && selectedOriginLocId) {
      filtered = filtered.filter(t => 
        t.originLocation?.idLoc === selectedOriginLocId
      );
    }

    if (startDate) {
      filtered = filtered.filter(t =>
        new Date(t.dateTransf) >= new Date(startDate)
      );
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      filtered = filtered.filter(t =>
        new Date(t.dateTransf) < end
      );
    }

    setFilteredTransfers(filtered);
  }, [transfers, transferSearchTerm, startDate, endDate, selectedOriginLocId, isAdmin]);

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
    if (isCreateMode)
    {
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
    };
    const payload = {
      originId: userData?.locId,
      destinyId: filteredLocations[0]?.idLoc,
      statusTransf: 'Pendiente',
      detailTransfers: spareParts
    };

    try {
      if (isCreateMode) {
        await createTransfer(payload);
      } else {
        const { statusTransf, origin, destiny } = selectedTransfer;
        const currentUserLocId = userData?.locId;

        const originId = origin?.idLoc;
        const destinyId = destiny?.idLoc;

        const isOriginUser = currentUserLocId === originId;
        const isDestinyUser = currentUserLocId === destinyId;

        let canUpdate = false;

        if (statusTransf === "Pendiente" && isOriginUser) {
          canUpdate = true;
        } else if (statusTransf === "En tránsito" && isDestinyUser) {
          canUpdate = true;
        } else if (statusTransf === "Entregado" && isDestinyUser) {
          canUpdate = true;
        }

        if (!canUpdate) {
          alert("No tienes permiso para actualizar esta transferencia.");
          return;
        }

        if (statusTransf === "Entregado" && isDestinyUser) {
          if (!conditionReport.status || !conditionReport.notes) {
            alert("Debes seleccionar una condición y escribir una descripción antes de completar la transferencia.");
            return;
          }

          // Aquí llamas a tu función para enviar el reporte
          await sendConditionReport({
            transferId: selectedTransfer.idTransf,
            user: userData?.username, // o nombre completo si lo tienes
            condition: conditionReport.status,
            details: conditionReport.notes
          });
        }

        await updateTransferStatus(selectedTransfer.idTransf);
      }

      setModalOpen(false);
      const allTransfers = await getTransfers();

      const filtered = allTransfers.filter(t =>
        t.originLocation.idLoc === userData?.locId || 
        t.destinyLocation.idLoc === userData?.locId
      );

      setTransfers(filtered);
    } catch (error) {
      console.error('Error al enviar la transferencia:', error);
    }
  };

  const renderTransferRow = (item, index) => (
    <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-50 dark:text-gray-200 transition-colors">
      <td className='px-4 py-2'>{item.originLocation?.nameSt}</td>
      <td className='px-4 py-2'>{item.destinyLocation?.nameSt}</td>
      <td className='px-4 py-2'>{new Date(item.dateTransf).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
      <td className='px-4 py-2'>
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
      <td className='px-4 py-2'>
        <span className={
          item.statusTransf === 'Completada'
            ? 'text-white dark:bg-green-700 bg-green-600 custom-status-design'
            : 'text-white dark:bg-yellow-700 bg-yellow-600 custom-status-design'
        }>
          {item.statusTransf}
        </span>
      </td>
      <td className='px-4 py-2'>
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
                locId={userData?.locId}
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

              {!isAdmin && (
                selectedTransfer?.statusTransf === "Completada" ? (
                  <span className="text-sm text-gray-400 italic">La transferencia ha sido completada</span>
                ) : selectedTransfer?.statusTransf === "En tránsito" && selectedTransfer?.origin?.idLoc === userData?.locId ? (
                  <span className="text-sm text-blue-500 italic">La transferencia está en tránsito. Solo el destinatario puede completar esta transferencia.</span>
                ) : selectedTransfer?.statusTransf === "Entregado" && selectedTransfer?.destiny?.idLoc === userData?.locId ? (
                  <>
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2 text-sm">Reporte de condiciones</h4>
                      <select
                        className="w-full border px-3 py-2 rounded mb-2"
                        value={conditionReport.status}
                        onChange={(e) => setConditionReport(prev => ({ ...prev, status: e.target.value }))}
                      >
                        <option value="">Selecciona una condición</option>
                        <option value="En orden">En orden</option>
                        <option value="Con averías">Con averías</option>
                      </select>
                      <textarea
                        className="w-full border px-3 py-2 rounded"
                        rows="4"
                        placeholder="Describe detalles de la condición del paquete..."
                        value={conditionReport.notes}
                        onChange={(e) => setConditionReport(prev => ({ ...prev, notes: e.target.value }))}
                      ></textarea>
                    </div>

                    <button
                      onClick={handleSubmit}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded mt-3"
                    >
                      Enviar reporte y completar transferencia
                    </button>
                  </>
                ) : (selectedTransfer?.statusTransf === "Pendiente" && selectedTransfer?.origin?.idLoc === userData?.locId) || 
                    (selectedTransfer?.statusTransf === "En tránsito" && selectedTransfer?.destiny?.idLoc === userData?.locId) ? (
                  <button
                    onClick={handleSubmit}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                  >
                    Actualizar
                  </button>
                ) : (
                  <span className="text-sm text-gray-400 italic">No tienes permiso para actualizar esta transferencia</span>
                )
              )}
              
              
            </>
          )}
        </div>
      </Modal>
      <PageBackground heightDefined={'min-h-full'}>
        <h1 className="text-xl font-bold mb-6 dark:text-white">Transferencias</h1>

        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <input
            type="text"
            placeholder="Buscar por destinatario..."
            className="input-design w-1/3 min-w-[200px]"
            onChange={(e) => setTrasnferSearchTerm(e.target.value)}
          />

          {isAdmin && (
            <select
              value={selectedOriginLocId}
              onChange={(e) => setSelectedOriginLocId(e.target.value)}
              className="input-design min-w-[200px]"
            >
              <option value="">Todos los almacenes de origen</option>
              {locations.map((loc) => {
                const regionName = regions.find(r => r.idReg === loc.idReg)?.descReg || "Región desconocida";
                return (
                  <option key={loc.idLoc} value={loc.idLoc}>
                    {regionName}
                  </option>
                );
              })}
            </select>
          )}

          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-design"
            />
            <span>—</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-design"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Records per page
            </span>
            <select
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              className="
                px-3 py-1.5 rounded-md
                border border-gray-300 dark:border-gray-600
                bg-white dark:bg-[#2d2d2d]
                text-gray-800 dark:text-gray-200
                focus:outline-none focus:ring-2 focus:ring-blue-400/70
                cursor-pointer
              "
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex flex-row gap-4">
            <div className="flex flex-row gap-1">
              <button className='bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg text-xl' title='Export to PDF'>
                <FaFilePdf />
              </button>
              <button className='bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg text-xl' title='Export to Excel'>
                <FaFileExcel />
              </button>
              <button className='bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-lg text-xl' title='Export to CSV'>
                <FaFileCsv />
              </button>
              <button className='bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg text-xl' title='Print the list'>
                <FaPrint />
              </button>
            </div>
            {!isAdmin && (
              <Button
                children="Nueva Transferencia"
                onclick={openCreateModal}
                primaryColor="bg-purple-600"
                hoverColor="hover:bg-purple-700"
              />
            )}
          </div>

          
        </div>

          
        <div className="overflow-x-auto rounded-lg shadow-sm border mb-2 border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className='dark:text-white'>Loading...</div>
          ) : (
            <Table theadText={theadText} tbodyData={filteredTransfers} renderRow={renderTransferRow} />
          )}
        </div>
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            <div className="inline-flex items-center">
              <MdKeyboardDoubleArrowLeft /> <span className="ml-1">Prev</span>
            </div>
            
          </button>

          <span className="text-sm dark:text-white">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            <div className="inline-flex items-center">
              <span className="mr-1">Next</span> <MdKeyboardDoubleArrowRight />
            </div>
          </button>
        </div>
      </PageBackground>
    </>
  );
}
