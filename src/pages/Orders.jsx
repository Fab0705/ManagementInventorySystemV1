import React, { useEffect, useState } from 'react';
import usePagination from '../hooks/usePagination';
import Button from '../components/Buttons/Button'
import ButtonAction from '../components/Buttons/ButtonAction';
import { FaFileCsv, FaFilePdf, FaPrint, FaFileExcel, FaTrash, FaEye } from "react-icons/fa";
import { getOrders, getOrderById, createOrder, updateOrderStatus, getOrdersByLocation} from '../services/orderService';
import { getAllLocations, getAllRegions } from '../services/dataService';
import { fetchMatchingParts } from '../services/sparePartService';
import { useAuth } from '../context/AuthContext';
import TableDetails from '../components/Table/TableDetails';
import SearchBar_Modal from '../components/SearchBar/SearchBar_Modal';
import PageBackground from '../components/UI/Background/PageBackground';
import Modal from '../components/Modals/Modal';
import Table from '../components/Table/Table';

const theadText = ['WO', 'Descripción', 'Fecha realizada', 'Estado', 'Acciones'];
const theadText_sparePart = ['N° de Parte', 'Descripción', 'Cantidad'];
const theadText_order = ['Work Order', 'Descripción'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [spareParts, setSpareParts] = useState([]);
  const [orderNumberDigits, setOrderNumberDigits] = useState('');
  const [orderDescription, setOrderDescription] = useState('');
  const [errors, setErrors] = useState({ digits: '', description: '', spareParts: ''});

  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);

  const [locations, setLocations] = useState([]);
  const [regions, setRegions] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
  } = usePagination(filteredOrders);

  const handleSparePartChange = (index, field, value) => {
    const updated = [...spareParts];
    updated[index][field] = value;
    setSpareParts(updated);
  };

  const handleCloseModal = () => {
    setModalOpen(false);

    if(isCreateMode)
    {
      setErrors({ digits: '', description: '', spareParts: ''});
      setOrderNumberDigits('');
      setOrderDescription('');
      setSpareParts([]);
    }
  };

  /* useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders(); // getOrders ya devuelve response.data
        setOrders(data); // aquí va directo
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []); */

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        let data
        if (isAdmin)
        {
          data = await getOrders();
        } else
        {
          data = await getOrdersByLocation(userData?.locId);
        }
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userData]);

  /* useEffect(() => {
    if (orderSearchTerm.trim() === '') {
      setFilteredOrders(orders);
    } else {
      const lower = orderSearchTerm.toLowerCase();
      const filtered = orders.filter(o =>
        o.workOrd?.toLowerCase().includes(lower)
      );
      setFilteredOrders(filtered);
    }
  }, [orderSearchTerm, orders]); */

  useEffect(() => {
    let filtered = [...orders];

    // Filtro por número de orden
    if (orderSearchTerm.trim() !== '') {
      const lower = orderSearchTerm.toLowerCase();
      filtered = filtered.filter(o =>
        o.workOrd?.toLowerCase().includes(lower)
      );
    }

    // Filtro por locación (solo si es admin)
    if (isAdmin && selectedLocationId) {
      filtered = filtered.filter(o => o.idLoc === selectedLocationId);
    }

    // Filtro por rango de fechas
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(o => new Date(o.dateOrd) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1); // incluir el día completo
      filtered = filtered.filter(o => new Date(o.dateOrd) < end);
    }

    setFilteredOrders(filtered);
  }, [orderSearchTerm, selectedLocationId, startDate, endDate, orders, isAdmin]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [locs, regs] = await Promise.all([
          getAllLocations(),
          getAllRegions()
        ]);
        setLocations(locs);
        setRegions(regs);
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };

    if (isAdmin) {
      fetchFilters();
    }
  }, [isAdmin]);

  const openEditModal = async (order) => {
    const data = await getOrderById(order.idOrd);    
    setSelectedOrder(data);
    setIsCreateMode(false);
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedOrder(null);
    setIsCreateMode(true);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (isCreateMode) 
    {
      const newErrors = { digits: '', description: '', spareParts: '' };
      let isValid = true;

      if (orderNumberDigits.length !== 9) {
        newErrors.digits = 'Debe tener exactamente 9 dígitos numéricos.';
        isValid = false;
      }

      if (!orderDescription.trim()) {
        newErrors.description = 'La descripción es obligatoria.';
        isValid = false;
      }

      if (spareParts.length < 1) {
        newErrors.spareParts = 'Debe agregar al menos 1 repuesto.';
        isValid = false;
      }

      setErrors(newErrors);

      if (!isValid) return;
    };

    try {
      if (isCreateMode) {
        const fullOrderCode = `W${orderNumberDigits}`;

        const payload = {
          workOrd: fullOrderCode,
          descOrd: orderDescription,// ← deberías cambiar esto según lo que selecciones
          idLoc: userData?.locId, // ← igual, deberías hacer select para destino
          statusOrd: 'Entregado',
          detailOrders: spareParts
        };

        await createOrder(payload);
      } else {
        await updateOrderStatus(selectedOrder?.idOrd);
      }

      setModalOpen(false);
      const updateOrders = await getOrdersByLocation(userData?.locId);;
      setOrders(updateOrders);
    } catch (error) {
      console.error('Error al enviar la orden:', error);
    }
  };

  const renderOrderRow = (item, index) => (
    <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-50 dark:text-gray-200 transition-colors">
      <td className='px-4 py-2'>{item.workOrd}</td>
      <td className='px-4 py-2'>{item.descOrd}</td>
      <td className='px-4 py-2'>{new Date(item.dateOrd).toLocaleString('es-PE', { 
        day: '2-digit', month: '2-digit', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      })}</td>
      <td className='px-4 py-2'>
        <span className={
          item.statusOrd === 'Pendiente' ? 'text-white dark:bg-yellow-700 bg-yellow-600 custom-status-design' :
          item.statusOrd === 'Entregado' ? 'text-white dark:bg-green-700 bg-green-600 custom-status-design' :
          'text-gray-600'
        }>
          {item.statusOrd}
        </span>
      </td>
      <td className='px-4 py-2 '>
        <ButtonAction
            primaryColor={"bg-green-600"}
            hoverColor={"hover:bg-green-700"}
            icon={FaEye}
            onclick={() => openEditModal(item)}
          />
      </td>
    </tr>
  );

  const renderSparePartsRow = (item, index) => (
    <tr key={index} className='border-b h-9 hover:bg-gray-50 dark:hover:bg-gray-700 text-center'>
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
        title={isCreateMode ? "Nueva Orden" : "Detalles de la Orden"}
      >
        <div className="space-y-3">
          
          {isCreateMode && (
            <>
              <hr className='text-black dark:text-white my-4' />
              <h3 className='font-bold italic mb-2 dark:text-white'>Ingresar Work Order</h3>
              <div className="flex gap-2 items-center mb-1">
                <input
                  value="W"
                  disabled
                  className="w-10 py-2 border rounded bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center font-bold"
                />
                <input
                  type="text"
                  maxLength={9}
                  value={orderNumberDigits}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) setOrderNumberDigits(val); // solo números
                  }}
                  placeholder="9 dígitos numéricos"
                  className={`flex-1 input-design ${errors.digits && 'border-red-500'}`}
                />
              </div>

              {errors.digits && <p className="text-sm text-red-500 mb-2">{errors.digits}</p>}

              <h3 className='font-bold italic my-2 dark:text-white'>Describir orden</h3>
              <textarea
                maxLength={200}
                value={orderDescription}
                onChange={(e) => setOrderDescription(e.target.value)}
                rows={3}
                placeholder="Describe brevemente esta orden (máx. 200 caracteres)"
                className={`w-full input-design ${errors.description && 'border-red-500'}`}
              />
              <div className="text-sm text-right text-gray-500 dark:text-gray-300 mb-1">
                {orderDescription.length}/200 caracteres
              </div>

              {errors.description && <p className="text-sm text-red-500 mb-2">{errors.description}</p>}

              <hr  className='text-black dark:text-white my-4' />
              <h3 className='font-bold italic mb-2 dark:text-white'>Repuestos a transferir</h3>
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
                    <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-2 px-3 dark:text-white">{sp.idSpare} - {sp.numPart}</td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="1"
                          value={sp.quantity}
                          onChange={(e) =>
                            handleSparePartChange(index, 'quantity', parseInt(e.target.value))
                          }
                          className="w-20 input-design"
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
              <hr className='dark:text-white' />
              <span className='flex flex-row justify-between dark:text-white'>
                  <p><strong>Fecha realizada la Orden:</strong></p>
                  {selectedOrder?.dateOrd &&
                      new Date(selectedOrder.dateOrd).toLocaleString('es-PE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                  })}
              </span>
              <h3 className='font-bold text-center italic mb-1 dark:text-white'>Descripción</h3>
              <TableDetails theadText={theadText_order}>
                <tr className='border-b h-9 hover:bg-gray-50 dark:hover:bg-gray-700 text-center'>
                  <td>{selectedOrder?.workOrd}</td>
                  <td>{selectedOrder?.descOrd}</td>
                </tr>
              </TableDetails>
              <h3 className='font-bold text-center italic mb-1 dark:text-white'>Repuestos solicitados</h3>
              <TableDetails
                theadText={theadText_sparePart}
                tbodyData={selectedOrder?.spareParts || []}
                renderRow={renderSparePartsRow}
              />

              <hr className='dark:text-white' />
              {!isAdmin && (
                  selectedOrder?.statusOrd === "Entregado"
                  ? (<span className="items-center text-sm text-gray-400 italic">La orden ha sido completada</span>)
                  : (<button
                      onClick={handleSubmit}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                    >
                      {isCreateMode ? 'Registrar' : 'Actualizar'}
                    </button>)
              )}
            </>
          )}
        </div>
      </Modal>
      
      <PageBackground heightDefined={'min-h-full'}>
        <h1 className="text-xl font-bold mb-6 text-black dark:text-white">Órdenes</h1>

        <div className="flex flex-wrap gap-4 items-center mb-4">

          {isAdmin && (
            <select
              className="border px-3 py-2 rounded"
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
            >
              <option value="">Todas las regiones</option>
              {locations.map(loc => (
                <option key={loc.idLoc} value={loc.idLoc}>
                  {`${regions.find(r => r.idReg === loc.idReg)?.descReg || 'Región desconocida'}`}
                </option>
              ))}
            </select>
          )}

          <input
            className="flex-1 min-w-[200px] input-design"
            placeholder="Buscar por número de orden..."
            onChange={(e) => setOrderSearchTerm(e.target.value)}
          />

          <input
            type="date"
            className="input-design"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input
            type="date"
            className="input-design"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

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
                children={"Nueva Orden"}
                onclick={openCreateModal}
                primaryColor={"bg-green-600"}
                hoverColor={"hover:bg-green-700"}
              />
            )}
          </div>
        </div>
          <div className="overflow-x-auto rounded-lg shadow-sm border mb-2 border-gray-200 dark:border-gray-700">
            {loading ? (
              <div className='dark:text-white'>Loading...</div>
            ) : (
              <Table theadText={theadText} tbodyData={filteredOrders} renderRow={renderOrderRow} />
            )}
          </div>
        
      </PageBackground>
    </>
  );
}