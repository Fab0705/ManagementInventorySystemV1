import React from 'react'

export default function Table({ theadText, tbodyData = [], renderRow }) {
  return (
    <>
        {/* <div className="overflow-x-auto rounded-lg shadow-sm border mb-2 border-gray-200 dark:border-gray-700">
            
        </div> */}

        <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                <tr>
                    {theadText.map((header, index) => (
                        <th key={index} className="px-4 py-3 font-medium tracking-wide text-sm border-b border-gray-300 dark:border-gray-700">{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-[#2C3E50]'>
                {tbodyData.map((item, index) => renderRow(item, index))}
            </tbody>
        </table>
    </>
    
  )
}
