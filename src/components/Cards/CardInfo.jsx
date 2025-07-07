import React from 'react'

export default function CardInfo({ children }) {
  return (
    <div className="bg-white rounded-md p-4 shadow w-full h-full dark:bg-cardBg-darkmode">
        {children}
    </div>
  )
}
