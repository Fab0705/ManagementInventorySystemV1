import React from 'react'
import Avatar from '../Avatar/Avatar'
import { FaRegQuestionCircle } from "react-icons/fa";
import { FaRegBell } from "react-icons/fa";
import { GoHistory } from "react-icons/go";


export default function NavBar() {
  return (
    <nav className='w-full flex justify-between size-12 items-center px-4 shadow-md'>
        <ul className='flex gap-6 items-center'>
            <li><GoHistory className='size-6'/></li>
            <li>
              <input type="text" placeholder='Search...' className="px-3 py-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-white bg-gray-200 w-80" />
            </li>
        </ul>
        <ul className='flex gap-6 items-center '>
            <li><FaRegBell className='size-6'/></li>
            <li><FaRegQuestionCircle className='size-6'/></li>
            <li><Avatar /></li>
        </ul>
    </nav>
  )
}
