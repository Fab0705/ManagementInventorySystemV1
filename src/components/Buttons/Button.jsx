import React from 'react'

export default function Button({children, onclick, primaryColor, hoverColor}) {
  return (
    <button onClick={onclick} className={`${primaryColor} text-white px-4 py-2 rounded ${hoverColor}`}>{children}</button>
  )
}
