import axios from 'axios'

const API_URL = 'https://localhost:7268/api/sparepart';

// ✅ Obtener todos los repuestos
export const getAllSpareParts = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error al obtener todos los repuestos:', error);
    throw error;
  }
};

// ✅ Obtener un repuesto por ID
export const getSparePartById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/by-id/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener repuesto con ID ${id}:`, error);
    throw error;
  }
};

// ✅ Obtener repuestos por localización
export const getSparePartsByLocation = async (idLoc) => {
  try {
    const response = await axios.get(`${API_URL}/by-location/${idLoc}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener repuestos de la localización ${idLoc}:`, error);
    throw error;
  }
};

// ✅ Crear un nuevo repuesto
export const createSparePart = async (sparePartData) => {
  try {
    const response = await axios.post(API_URL, sparePartData);
    return response.data;
  } catch (error) {
    console.error('Error al crear repuesto:', error);
    throw error;
  }
};

// ✅ Actualizar un repuesto
export const updateSparePart = async (sparePartData) => {
  try {
    const response = await axios.put(API_URL, sparePartData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar repuesto:', error);
    throw error;
  }
};

export const updateStock = async (idSpare, idLoc, quantity) => {
  return await axios.put(`${API_URL}/${idSpare}/stock/${idLoc}?quantity=${quantity}`, {
    headers: { 'Content-Type': 'application/json' }
  });
};

// ✅ Eliminar un repuesto
export const deleteSparePart = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar repuesto con ID ${id}:`, error);
    throw error;
  }
};
export const fetchMatchingParts = async (query, locId) => {
  const response = await axios.get(`${API_URL}/search`, {
    params: {
      query,
      locId
    }
  });
  return response.data;
};