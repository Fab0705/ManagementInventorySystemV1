import axios from 'axios'

const API_URL = 'https://localhost:7268/api/data';

// ✅ Obtener todas las regiones
export const getAllRegions = async () => {
  try {
    const response = await axios.get(`${API_URL}/region`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener regiones:', error);
    throw error;
  }
};

// ✅ Obtener todas las ubicaciones de almacenamiento
export const getAllLocations = async () => {
  try {
    const response = await axios.get(`${API_URL}/location`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener ubicaciones:', error);
    throw error;
  }
};