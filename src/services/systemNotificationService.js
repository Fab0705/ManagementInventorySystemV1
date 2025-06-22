import axios from 'axios';
const API_URL = 'https://localhost:7268/api/notifications';

export const getNotifications = async (idLoc) => {
  try {
    const response = await axios.get(`${API_URL}/${idLoc}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    throw error;
  }
};