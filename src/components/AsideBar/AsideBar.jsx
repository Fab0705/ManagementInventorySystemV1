import React from 'react';
import AsideBarButton from './AsideBarButton';
import { useLocation, useNavigate } from 'react-router-dom';

import { HiOutlineTruck, HiTruck } from "react-icons/hi2";
import { MdOutlineInventory2, MdInventory2 } from "react-icons/md";
import { TbDashboard, TbDashboardFilled } from "react-icons/tb";
import { IoSettingsOutline, IoSettingsSharp } from "react-icons/io5";
import { BiPurchaseTag, BiSolidPurchaseTag, BiTransferAlt } from "react-icons/bi";
import { HiOutlineDocumentReport, HiDocumentReport } from "react-icons/hi";
import { IoIosNotificationsOutline, IoMdNotifications } from "react-icons/io";
import { useAuth } from '../../context/AuthContext';
import { FiLogOut } from "react-icons/fi";

const itemsDesc = ['Home', 'Inventory', 'Orders', 'Transfers', 'System Notifications', 'Settings'];
const routes = ['/', '/inventory', '/orders', '/transfers', '/notifications', '/settings'];
const itemsIcoLight = [TbDashboard, MdOutlineInventory2, HiOutlineTruck, BiTransferAlt, IoIosNotificationsOutline, IoSettingsOutline];
const itemsIcoFilled = [TbDashboardFilled, MdInventory2, HiTruck, BiTransferAlt, IoMdNotifications, IoSettingsSharp];

export default function AsideBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, logout } = useAuth();

  const isAdmin = userData?.roles === "Jefe de Logística";

  const allowedIndexes = isAdmin ? [1, 2, 3] : [0, 1, 2, 3, 4, 5, 6];

  return (
    <aside className='h-dvh w-1/7 shadow-xl flex flex-col justify-between'>
      <div>
        <h2 className='h-12 text-center content-center'>IDERKA</h2>
        <ul className='px-8'>
          {allowedIndexes.map((index) => {
            const isActive = location.pathname === routes[index];
            const Icon = isActive ? itemsIcoFilled[index] : itemsIcoLight[index];
            return (
              <li key={itemsDesc[index]}>
                <AsideBarButton icon={Icon} onclick={() => navigate(routes[index])} isActive={isActive}>
                  {itemsDesc[index]}
                </AsideBarButton>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Cerrar sesión */}
      <div className='px-8 mb-4'>
        <AsideBarButton icon={FiLogOut} onclick={logout} isActive={false}>
          Cerrar sesión
        </AsideBarButton>
      </div>
    </aside>
  );
}
