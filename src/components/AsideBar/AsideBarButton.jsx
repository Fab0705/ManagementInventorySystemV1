import React from 'react'

export default function AsideBarButton({children, icon: Icon, onclick, isActive}) {
  return (
    <button
    onClick={onclick}
    className={`w-full p-4 my-2 rounded-2xl flex gap-5 items-center cursor-pointer transition duration-200 ease-in-out hover:scale-105
      ${isActive ? 'bg-sky-200 font-bold' : 'hover:bg-sky-100'}`}
    >
        <span>{Icon && <Icon size={18} />}</span>
        {children}
    </button>
  )
}
