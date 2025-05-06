import React from 'react'
import reactLogo from '../../assets/react.svg'

export default function Avatar() {
  return (
    <div className='size-8 rounded-full overflow-hidden bg-amber-300'>
        <img src={reactLogo} alt="React" className='w-full h-full object-cover' />
    </div>
  )
}
