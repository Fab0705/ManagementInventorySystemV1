import React from 'react';
import AsideBarButton from './AsideBarButton';
import { useLocation, useNavigate } from 'react-router-dom';

import { HiOutlineTruck, HiTruck } from "react-icons/hi2";
import { MdOutlineInventory2, MdInventory2 } from "react-icons/md";
import { TbDashboard, TbDashboardFilled } from "react-icons/tb";
import { IoSettingsOutline, IoSettingsSharp } from "react-icons/io5";
import { BiPurchaseTag, BiSolidPurchaseTag, BiTransferAlt } from "react-icons/bi";
import { HiOutlineDocumentReport, HiDocumentReport } from "react-icons/hi";

const itemsDesc = ['Dashboard', 'Inventory', 'Orders', 'Transfers', 'Purchases', 'Reports', 'Settings'];
const routes = ['/', '/inventory', '/orders', '/transfers', '/purchases', '/reports', '/settings'];
const itemsIcoLight = [TbDashboard, MdOutlineInventory2, HiOutlineTruck, BiTransferAlt, BiPurchaseTag, HiOutlineDocumentReport, IoSettingsOutline];
const itemsIcoFilled = [TbDashboardFilled, MdInventory2, HiTruck, BiTransferAlt, BiSolidPurchaseTag, HiDocumentReport, IoSettingsSharp];

export default function AsideBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className='h-dvh w-1/7 shadow-xl'>
        <h2 className='h-12 text-center content-center'>IDERKA</h2>
        <ul className='px-8'>
            {itemsDesc.map((desc, index) => {
              const isActive = location.pathname === routes[index];
              const Icon = isActive ? itemsIcoFilled[index] : itemsIcoLight[index];
              return  (
                <li key={desc}>
                  <AsideBarButton icon={Icon} onclick={() => navigate(routes[index])} isActive={isActive} >
                    {desc}
                  </AsideBarButton>
                </li>
              );
            })}
        </ul>
    </aside>
  )
}
