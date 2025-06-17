import React from 'react'

export default function ButtonAction({ primaryColor, hoverColor, icon: Icon, onclick }) {
  return (
    <button 
      onClick={onclick}
      className={`rounded p-1.5 text-sm ${primaryColor} text-white ${hoverColor}`}
    >
      {Icon && <Icon />}
    </button>
  );
}
