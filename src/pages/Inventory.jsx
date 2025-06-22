import React, { useEffect, useState } from 'react';
import Button from '../components/Buttons/Button';
import ButtonAction from '../components/Buttons/ButtonAction';
import { MdModeEditOutline } from "react-icons/md";
import Table from '../components/Table/Table';
import Modal from '../components/Modals/Modal';
import { getAllSpareParts, getSparePartById, createSparePart, updateSparePart, getSparePartsByLocation, updateStock } from '../services/sparePartService';
import { getAllLocations, getAllRegions } from '../services/dataService';
import { useAuth } from '../context/AuthContext';

const theadText = ['Número de Parte', 'Descripción', 'Rework', 'Stock', 'Acciones'];

export default function Inventory() {
  const [spareParts, setSpareParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [errors, setErrors] = useState({ numberPart: '', descPart: '', rework: '', sparePartStocks: ''});

  const [numberPart, setNumberPart] = useState('');
  const [descPart, setDescPart] = useState('');
  const [rework, setRework] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [idSpare, setIdSpare] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSpareParts, setFilteredSpareParts] = useState([]);

  const [locations, setLocations] = useState([]);
  const [regions, setRegions] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');

  const { userData } = useAuth();

  const isAdmin = userData?.roles === 'Jefe de Logística';

  const handleCloseModal = () => {
    setModalOpen(false);
    setNumberPart('');
    setDescPart('');
    setRework(false);
    setQuantity(1);
    setIdSpare(null);
    setErrors({ numberPart: '', descPart: '', rework: '', sparePartStocks: '' });
  };

  useEffect(() => {
    const fetchSpareParts = async () => {
      try {
        let data;
        if (isAdmin) {
          data = await getAllSpareParts();
        } else {
          data = await getSparePartsByLocation(userData?.locId);
        }

        setSpareParts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching spare parts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      fetchSpareParts();
    }
  }, [userData]);

  useEffect(() => {
    let filtered = [...spareParts];

    if (selectedLocationId) {
      filtered = filtered.filter(sp =>
        sp.sparePartStocks?.some(stock => stock.idLoc === selectedLocationId)
      );

      console.log(filtered);
    }

    if (searchTerm.trim() !== '') {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(sp =>
        sp.numberPart.toLowerCase().includes(lowerTerm)
      );
    }

    setFilteredSpareParts(filtered);
  }, [searchTerm, spareParts, selectedLocationId]);

  useEffect(() => {
    const fetchLocationsAndRegions = async () => {
      try {
        const [locData, regData] = await Promise.all([
          getAllLocations(),
          getAllRegions()
        ]);
        setLocations(locData);
        setRegions(regData);
      } catch (err) {
        console.error("Error al obtener locaciones y regiones:", err);
      }
    };

    if (isAdmin) fetchLocationsAndRegions();
  }, [isAdmin]);

  const openEditModal = async (sparePart) => {
    const data = await getSparePartById(sparePart.idSpare);
    setIdSpare(data.idSpare);
    setNumberPart(data.numberPart);
    setDescPart(data.descPart);
    setRework(data.rework);
    const myStock = data.sparePartStocks?.find(s => s.idLoc === userData?.locId);
    setQuantity(myStock?.quantity || 0);
    setIsCreateMode(false);
    setModalOpen(true);
  };
  
  const openCreateModal = () => {
    setNumberPart('');
    setDescPart('');
    setRework(false);
    setQuantity(1);
    setIdSpare(null);
    setErrors({ numberPart: '', descPart: '', rework: '', sparePartStocks: '' });
    setIsCreateMode(true);
    setModalOpen(true);
  };
  const handleSubmit = async () => {
    const newErrors = { numberPart: '', descPart: '', quantity: '' };
    let isValid = true;

    if (!numberPart.trim()) {
      newErrors.numberPart = 'El número de parte es obligatorio.';
      isValid = false;
    }
    if (!descPart.trim()) {
      newErrors.descPart = 'La descripción es obligatoria.';
      isValid = false;
    }
    if (quantity <= 0) {
      newErrors.quantity = 'La cantidad debe ser mayor a 0.';
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) return;

    const payload = {
      numberPart,
      descPart,
      rework,
      sparePartStocks: [
        {
          idLoc: userData?.locId,
          quantity
        }
      ]
    };

    try {
      if (isCreateMode) {
        await createSparePart(payload);
      } else {
        await updateStock(idSpare, userData.locId, quantity);
      }

      setModalOpen(false);

      const updated = userData?.role === 'Admin'
        ? await getAllSpareParts()
        : await getSparePartsByLocation(userData?.locId);

      setSpareParts(Array.isArray(updated) ? updated : []);
    } catch (err) {
      console.error('Error al guardar repuesto:', err);
    }
  };

  const renderProductRow = (item, index) => (
    <tr key={index} className="border-b h-9 hover:bg-gray-50">
      <td>{item.numberPart}</td>
      <td>{item.descPart}</td>
      <td>{item.rework ? 'Yes' : 'No'}</td>
      <td>
          {item.sparePartStocks && item.sparePartStocks.length > 0 ? (
            selectedLocationId
              ? item.sparePartStocks.find(s => s.idLoc === selectedLocationId)?.quantity ?? '0'
              : item.sparePartStocks.reduce((acc, stock) => acc + stock.quantity, 0)
          ) : 'No stock'}
      </td>      
      <td>
        {!isAdmin && (
          <ButtonAction
            primaryColor={"bg-blue-600"}
            hoverColor={"hover:bg-blue-700"}
            icon={MdModeEditOutline}
            onclick={() => openEditModal(item)}
          />
        )}
      </td>
    </tr>
  );

  return (
    <>
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={isCreateMode ? "Nuevo Repuesto" : "Detalles del repuesto"}
      >
        <div className="space-y-3">
          <hr />

          <div className="flex flex-row gap-4">
            
            <div className="flex-1">
              <label className="block font-bold italic mb-1">Número de Parte</label>
              <input
                type="text"
                value={numberPart}
                onChange={(e) => setNumberPart(e.target.value)}
                placeholder="Ej: 1234567890"
                className={`w-full px-3 py-2 border rounded ${errors.numberPart ? 'border-red-500' : ''}`}
                readOnly
              />
              {errors.numberPart && (
                <p className="text-sm text-red-500 mt-1">{errors.numberPart}</p>
              )}
            </div>

            <div className="w-40">
              <label className="block font-bold italic mb-1">Cantidad en stock</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded ${errors.quantity ? 'border-red-500' : ''}`}
                
              />
              {errors.quantity && (
                <p className="text-sm text-red-500 mt-1">{errors.quantity}</p>
              )}
            </div>
          </div>
          
          <label className='block font-bold italic mt-3'>Descripción</label>
          <textarea
            value={descPart}
            onChange={(e) => setDescPart(e.target.value)}
            rows={3}
            placeholder="Máx. 200 caracteres"
            maxLength={200}
            className={`w-full px-3 py-2 border rounded ${errors.descPart && 'border-red-500'}`}
            readOnly
          />
          <div className="text-sm text-right text-gray-500">
            {descPart.length}/200 caracteres
          </div>
          {errors.descPart && <p className="text-sm text-red-500">{errors.descPart}</p>}

          <div className="flex items-center gap-2 mt-3">
            <input
              type="checkbox"
              checked={rework}
              onChange={(e) => setRework(e.target.checked)}
              id="rework"
            />
            <label htmlFor="rework" className="font-medium">¿Es rework?</label>
          </div>

          <hr />
          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
          >
            {isCreateMode ? 'Registrar' : 'Actualizar'}
          </button>
        </div>
      </Modal>

      <div className="bg-gray-100 w-full h-dvh p-6 overflow-y-auto">
        <h1 className="text-xl font-bold mb-6">Repuestos</h1>
        <div className="flex justify-between items-center mb-4 gap-4">
          <input
            className="border px-3 py-2 rounded w-1/3"
            placeholder="Buscar por número de parte..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {isAdmin && (
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="border px-3 py-2 rounded"
            >
              <option value="">Todas las ubicaciones</option>
              {locations.map(loc => (
                <option key={loc.idLoc} value={loc.idLoc}>
                  {
                    `${regions.find(r => r.idReg === loc.idReg)?.descReg || 'Región desconocida'}`
                  }
                </option>
              ))}
            </select>
          )}

          {!isAdmin && (
            <Button
              children={"Agregar Repuesto"}
              onclick={() => openCreateModal()}
              primaryColor={"bg-blue-600"}
              hoverColor={"hover:bg-blue-700"}
            />
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-4 overflow-auto">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <Table theadText={theadText} tbodyData={filteredSpareParts} renderRow={renderProductRow} />
          )}
        </div>
      </div>
    </>
  );
}