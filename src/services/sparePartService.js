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

export const fetchMatchingParts = async (query) => {
  try
  {
    const res = await fetch(`${API_URL}/search?query=${query}`);
    const data = await res.json();
    return data; // puedes usar esto para autocomplete
  } catch (error) {
    console.error(`Error al buscar el repuesto con numero ${query}:`, error);
    throw error;
  }
};