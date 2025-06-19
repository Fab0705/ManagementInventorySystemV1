import axios from 'axios'

const API_URL = 'https://localhost:7268/api/user';

// ✅ Obtener todos los usuarios
export const getUsers = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

export const loginAuth = async (loginData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, loginData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Error desconocido' };
  }
};