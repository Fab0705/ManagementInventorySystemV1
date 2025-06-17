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

// Realizar Login
export const loginAuth = async (transferData) => {
  try {
    const response = await axios.post(API_URL, transferData);
    return response.data;
  } catch (error) {
    console.error('Error al iniciar sesion:', error);
    throw error;
  }
};