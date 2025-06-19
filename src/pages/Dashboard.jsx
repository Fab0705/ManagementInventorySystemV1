import React from 'react'
import CardGeneralInfo from '../components/Cards/CardGeneralInfo'
import { useAuth } from '../context/AuthContext';

const titles = ['Total Stock', 'Stock Value', 'Low Stock Items', 'Out of Stock Items']
const datas = ['42,560', '$875,400', '12', '5']
const descs = ['In Stock | All Locations', 'All Locations', 'Below-Minimun Quantity', 'Across All Locations']

export default function Dashboard() {
  const { logout } = useAuth();
  const { userData } = useAuth();
  return (
    <div className='bg-gray-100 w-full h-dvh p-6'>
        {/* <p>Usuario: {userData?.username}</p>
        <p>Rol: {userData?.roles}</p>
        <p>Email: {userData?.emails}</p>
        <p>ID Ubicación: {userData?.locId}</p>
        <p>Nombre Ubicación: {userData?.locName}</p> */}
        <button onClick={logout}>Cerrar sesión</button>
        <h1 className="text-xl font-bold mb-6">Dashboard</h1>
        <div className="flex flex-wrap gap-6">
            {titles.map((desc, index) => {
                const Data = datas[index];
                const Desc = descs[index];
                return (
                    <CardGeneralInfo key={index} title={desc} data={Data} desc={Desc} />
                );
            })}
        </div>
    </div>
  )
}
