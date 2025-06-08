import axios from 'axios'

const API_URL = 'https://localhost:7268/api/transfer';

// ✅ Obtener todas las transferencias
export const getTransfers = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error al obtener transferencias:', error);
    throw error;
  }
};

// ✅ Obtener una transferencia por ID
export const getTransferById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener la transferencia con ID ${id}:`, error);
    throw error;
  }
};

// ✅ Crear una nueva transferencia
export const createTransfer = async (transferData) => {
  try {
    const response = await axios.post(API_URL, transferData);
    return response.data;
  } catch (error) {
    console.error('Error al crear transferencia:', error);
    throw error;
  }
};

// ✅ Cambiar el estado de una transferencia
export const updateTransferStatus = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar estado de la transferencia ${id}:`, error);
    throw error;
  }
};