import React from 'react'

export default function AsideBarButton({children, icon: Icon, onclick, isActive}) {
  return (
    <button
    onClick={onclick}
    className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all font-medium
      ${isActive ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800  dark:text-[#e3e5e5]'}`}
    >
        <div className="flex items-center gap-5">
          {Icon && <Icon size={18} />}
          {children}
        </div>
    </button>
  )
}
