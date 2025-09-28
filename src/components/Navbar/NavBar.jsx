import React from 'react'
import Avatar from '../Avatar/Avatar'
import useDarkMode from '../../hooks/useDarkMode';
import { useAuth } from '../../context/AuthContext';
import { FaRegBell, FaRegQuestionCircle } from 'react-icons/fa';
import { IoSunnyOutline, IoMoonOutline } from 'react-icons/io5';


export default function NavBar() {
  const [darkMode, toggleTheme] = useDarkMode();
  const { userData } = useAuth();

  return (
    <nav className="w-full h-16 px-6 flex items-center justify-between shadow-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-white z-10">
      <div className="text-lg font-semibold">Bienvenido, {userData?.roles} - {userData?.username}</div>
      <div className="flex items-center gap-6">
        <div
          onClick={toggleTheme}
          className={`w-12 h-6 flex items-center px-1 rounded-full cursor-pointer transition-colors duration-300
            ${darkMode ? 'bg-violet-400' : 'bg-gray-300'}`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300
              ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}
          >
            {darkMode ? (
              <IoMoonOutline className="text-gray-600 text-sm m-[2px]" />
            ) : (
              <IoSunnyOutline className="text-gray-500 text-sm m-[2px]" />
            )}
          </div>
        </div>
        <FaRegBell className="text-xl" />
        <FaRegQuestionCircle className="text-xl" />
        {/* <Avatar /> */}
      </div>
    </nav>
  )
}
