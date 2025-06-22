import axios from 'axios'

const API_URL = 'https://localhost:7268/api/orders';

// ✅ Obtener todas las órdenes
export const getOrders = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    throw error;
  }
};

export const getOrdersByLocation = async (idLoc) => {
  try {
    const response = await axios.get(`${API_URL}/by-location/${idLoc}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener órdenes por localización:`, error);
    throw error;
  }
};

// ✅ Obtener una orden por ID
export const getOrderById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener la orden con ID ${id}:`, error);
    throw error;
  }
};

// ✅ Crear una nueva orden
export const createOrder = async (orderData) => {
  try {
    const response = await axios.post(API_URL, orderData);
    return response.data;
  } catch (error) {
    console.error('Error al crear orden:', error);
    throw error;
  }
};

// ✅ Actualizar el estado de una orden
export const updateOrderStatus = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar estado de la orden ${id}:`, error);
    throw error;
  }
};