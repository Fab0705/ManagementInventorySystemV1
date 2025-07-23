import React from 'react'
import CardGeneralInfo from '../components/Cards/CardGeneralInfo'
import { useAuth } from '../context/AuthContext';
import PageBackground from '../components/UI/Background/PageBackground';

const titles = ['Total Stock', 'Stock Value', 'Low Stock Items', 'Out of Stock Items']
const datas = ['42,560', '$875,400', '12', '5']
const descs = ['In Stock | All Locations', 'All Locations', 'Below-Minimun Quantity', 'Across All Locations']

export default function Dashboard() {
  const { userData } = useAuth();
  return (
    <PageBackground heightDefined={'min-h-full'}>
      <h1 className="text-xl font-bold mb-6 dark:text-white">Bienvenido! {userData?.username}</h1>
    </PageBackground>
    
  )
}
