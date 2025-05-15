import React from 'react'

export default function ButtonAction({primaryColor, hoverColor, icon:Icon}) {
  return (
    <button className={`rounded p-1.5 text-sm ${primaryColor} text-white ${hoverColor}`}>{Icon && <Icon />}</button>
  )
}
