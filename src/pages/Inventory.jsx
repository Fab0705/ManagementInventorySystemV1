import React, { useEffect, useState } from 'react';
import Button from '../components/Buttons/Button';
import ButtonAction from '../components/Buttons/ButtonAction';
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight, MdModeEditOutline, MdDelete } from "react-icons/md";
import { FaFileCsv, FaFilePdf, FaPrint, FaFileExcel } from "react-icons/fa";
import Table from '../components/Table/Table';
import Modal from '../components/Modals/Modal';
import { getAllSpareParts, getSparePartById, createSparePart, updateSparePart, getSparePartsByLocation, updateStock } from '../services/sparePartService';
import { getAllLocations, getAllRegions } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import usePagination from '../hooks/usePagination';
import PageBackground from '../components/UI/Background/PageBackground';

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

  const {
    currentData,
    currentPage,
    totalPages,
    rowsPerPage,
    handleChangeRowsPerPage,
    handlePrevPage,
    handleNextPage,
    setCurrentPage
  } = usePagination(filteredSpareParts);

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
    <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-50 dark:text-gray-200 transition-colors">
      <td className="px-4 py-2">{item.numberPart}</td>
      <td className="px-4 py-2">{item.descPart}</td>
      <td className="px-4 py-2">{item.rework ? (<span className='text-white dark:bg-green-700 bg-green-600 custom-status-design'>Yes</span>) : (<span className='text-white dark:bg-red-700 bg-red-600 custom-status-design'>No</span>)}</td>
      <td className="px-4 py-2">
          {item.sparePartStocks && item.sparePartStocks.length > 0 ? (
            selectedLocationId
              ? item.sparePartStocks.find(s => s.idLoc === selectedLocationId)?.quantity ?? '0'
              : item.sparePartStocks.reduce((acc, stock) => acc + stock.quantity, 0)
          ) : 'No stock'}
      </td>      
      <td className="px-4 py-2">
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
              <label className="block font-bold italic mb-1 text-black dark:text-white">Número de Parte</label>
              <input
                type="text"
                value={numberPart}
                onChange={(e) => {setNumberPart(e.target.value)}}
                placeholder="Ej: 1234567890"
                maxLength={12}
                /* className={`w-full px-3 py-2 border rounded ${errors.numberPart ? 'border-red-500' : ''}`} */
                className={`w-full input-design ${errors.numberPart ? 'border-red-500' : ''}`}
              />
              {errors.numberPart && (
                <p className="text-sm text-red-500 mt-1">{errors.numberPart}</p>
              )}
            </div>

            <div className="w-40">
              <label className="block font-bold italic mb-1 text-black dark:text-white">Cantidad en stock</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                /* className={`w-full px-3 py-2 border rounded ${errors.quantity ? 'border-red-500' : ''}`} */
                className={`w-full input-design ${errors.numberPart ? 'border-red-500' : ''}`}
                
              />
              {errors.quantity && (
                <p className="text-sm text-red-500 mt-1">{errors.quantity}</p>
              )}
            </div>
          </div>
          
          <label className='block font-bold italic mt-3 text-black dark:text-white'>Descripción</label>
          <textarea
            value={descPart}
            onChange={(e) => setDescPart(e.target.value)}
            rows={3}
            placeholder="Máx. 200 caracteres"
            maxLength={200}
            /* className={`w-full px-3 py-2 border rounded ${errors.descPart && 'border-red-500'}`} */
            className={`w-full input-design ${errors.numberPart ? 'border-red-500' : ''}`}
          />
          <div className="text-sm text-right text-gray-500">
            {descPart.length}/200 caracteres
          </div>
          {errors.descPart && <p className="text-sm text-red-500">{errors.descPart}</p>}

          <div className="flex flex-col gap-2">
            <label htmlFor="rework" className="font-medium text-black dark:text-white">¿Es rework? <span className='italic text-gray-400 dark:text-gray-500'>(Si no es rework, no marcarlo)</span></label>
            <input
              type="checkbox"
              checked={rework}
              onChange={(e) => setRework(e.target.checked)}
              id="rework"
              className='h-5 w-5 transition-all cursor-pointer'
            />
          </div>

          <hr className='text-black dark:text-white my-4' />
          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
          >
            {isCreateMode ? 'Registrar' : 'Actualizar'}
          </button>
        </div>
      </Modal>
      <PageBackground heightDefined={'min-h-full'}>
        <h1 className="text-xl font-bold mb-6 dark:text-white">Repuestos</h1>
        <div className="flex justify-between items-center mb-4 gap-4">
          <input
            className="w-1/3 px-4 py-2 rounded-2xl
            border border-gray-200 dark:border-gray-700
            bg-white dark:bg-[#2d2d2d]
            text-gray-900 dark:text-gray-100
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-400/70
            shadow-sm dark:shadow-none"
            placeholder="Buscar por número de parte..."
            onChange={(e) => setSearchTerm(e.target.value)}
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
                children={"Agregar Repuesto"}
                onclick={() => openCreateModal()}
                primaryColor={"bg-blue-600"}
                hoverColor={"hover:bg-blue-700"}
              />
            )}
          </div>
          
        </div>

        <div className="overflow-x-auto rounded-lg shadow-sm border mb-2 border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className='dark:text-white'>Loading...</div>
          ) : (
            <Table theadText={theadText} tbodyData={currentData} renderRow={renderProductRow} />
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