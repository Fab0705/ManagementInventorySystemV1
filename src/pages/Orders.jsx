import React, { useEffect, useState } from 'react';
import Button from '../components/Buttons/Button'
import ButtonAction from '../components/Buttons/ButtonAction';
import { FaEye, FaTrash } from "react-icons/fa";
import { getOrders, getOrderById, createOrder, updateOrderStatus} from '../services/orderService';
import { fetchMatchingParts } from '../services/sparePartService';
import { useAuth } from '../context/AuthContext';
import TableDetails from '../components/Table/TableDetails';
import SearchBar_Modal from '../components/SearchBar/SearchBar_Modal';
import Modal from '../components/Modals/Modal';
import Table from '../components/Table/Table';

const theadText = ['WO', 'Description', 'Date', 'Status', 'Action'];
const theadText_sparePart = ['Number Part', 'Description', 'Quantity'];
const theadText_order = ['Work Order', 'Description'];

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
      setErrors({ digits: '', description: '', spareParts: ''});
      setOrderNumberDigits('');
      setOrderDescription('');
      setSpareParts([]);
    }
  };

  useEffect(() => {
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
  }, []);

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

    try {
      if (isCreateMode) {
        const fullOrderCode = `W${orderNumberDigits}`;

        const payload = {
          workOrd: fullOrderCode,
          descOrd: orderDescription,// ← deberías cambiar esto según lo que selecciones
          idLoc: userData?.locId, // ← igual, deberías hacer select para destino
          statusOrd: 'Pendiente',
          detailOrders: spareParts
        };

        await createOrder(payload);
      } else {
        await updateOrderStatus(selectedOrder.idOrd);
      }

      setModalOpen(false);
      const updateOrders = await getOrders();
      setTransfers(updateOrders);
    } catch (error) {
      console.error('Error al enviar la transferencia:', error);
    }
  };

  const renderOrderRow = (item, index) => (
    <tr key={index} className="border-b h-9 hover:bg-gray-50">
      <td>{item.workOrd}</td>
      <td>{item.descOrd}</td>
      <td>{new Date(item.dateOrd).toLocaleString('es-PE', { 
        day: '2-digit', month: '2-digit', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      })}</td>
      <td>
        <span className={
          item.statusOrd === 'Pendiente' ? 'text-yellow-600' :
          item.statusOrd === 'Entregado' ? 'text-green-600' :
          'text-gray-600'
        }>
          {item.statusOrd}
        </span>
      </td>
      <td>
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
        title={isCreateMode ? "Nueva Orden" : "Detalles de la Orden"}
      >
        <div className="space-y-3">
          
          {isCreateMode && (
            <>
              <hr />
              <h3 className='font-bold italic mb-1'>Ingresar Work Order</h3>
              <div className="flex gap-2 items-center mb-1">
                <input
                  value="W"
                  disabled
                  className="w-10 px-3 py-2 border rounded bg-gray-100 text-center font-bold"
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
                  className={`flex-1 px-3 py-2 border rounded ${errors.digits && 'border-red-500'}`}
                />
              </div>

              {errors.digits && <p className="text-sm text-red-500 mb-2">{errors.digits}</p>}

              <h3 className='font-bold italic mb-1'>Describir orden</h3>
              <textarea
                maxLength={200}
                value={orderDescription}
                onChange={(e) => setOrderDescription(e.target.value)}
                rows={3}
                placeholder="Describe brevemente esta orden (máx. 200 caracteres)"
                className={`w-full px-3 py-2 border rounded ${errors.description && 'border-red-500'}`}
              />
              <div className="text-sm text-right text-gray-500 mb-1">
                {orderDescription.length}/200 caracteres
              </div>

              {errors.description && <p className="text-sm text-red-500 mb-2">{errors.description}</p>}

              <hr />
              <h3 className='font-bold italic mb-2'>Repuestos a transferir</h3>
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
              <span className='flex flex-row justify-between'>
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
              <h3 className='font-bold text-center italic mb-1'>Descripción</h3>
              <TableDetails theadText={theadText_order}>
                <tr className='border-b h-9 hover:bg-gray-50 text-center'>
                  <td>{selectedOrder?.workOrd}</td>
                  <td>{selectedOrder?.descOrd}</td>
                </tr>
              </TableDetails>
              <h3 className='font-bold text-center italic mb-1'>Repuestos solicitados</h3>
              <TableDetails
                theadText={theadText_sparePart}
                tbodyData={selectedOrder?.spareParts || []}
                renderRow={renderSparePartsRow}
              />

              <hr />
              
              {selectedOrder?.statusTransf === "Completada"
                ? <span className="items-center text-sm text-gray-400 italic">La orden ha sido completada</span>
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
        <h1 className="text-xl font-bold mb-6">Órdenes</h1>

        <div className="flex justify-between items-center mb-4">
          <input className="border px-3 py-2 rounded w-1/3" placeholder="Buscar orden o cliente..." />
          <Button 
            children={"New Order"} 
            onclick={openCreateModal} 
            primaryColor={"bg-green-600"} 
            hoverColor={"hover:bg-green-700"} 
          />
        </div>

        <div className="bg-white rounded-xl shadow p-4 overflow-auto">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <Table theadText={theadText} tbodyData={orders} renderRow={renderOrderRow} />
          )}
        </div>
      </div>
    </>
  );
}