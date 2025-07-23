import React from 'react'

export default function PageBackground({ children, heightDefined }) {
  return (
    <div className={`bg-gray-100 w-full flex-1 ${heightDefined} big-screen:min-h-0 big-screen:h-full p-6 dark:bg-pagesBg-darkmode`}>
        {children}
    </div>
  )
}
