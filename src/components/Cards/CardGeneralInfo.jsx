import React from 'react'

export default function CardGeneralInfo({title, data, desc}) {
  return (
    <div className='bg-neutral-50 p-3 rounded-lg shadow-md w-50'>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className='text-3xl font-semibold'>{data}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </div>
  )
}
