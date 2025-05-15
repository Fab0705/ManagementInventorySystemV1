import React from 'react'

export default function Table({ theadText, tbodyData, renderRow }) {
  return (
    <table className="w-full text-sm text-left">
        <thead className="text-gray-600 border-b">
            <tr>
                {theadText.map((header, index) => (
                    <th key={index}>{header}</th>
                ))}
            </tr>
        </thead>
        <tbody>
            {tbodyData.map((item, index) => renderRow(item, index))}
        </tbody>
    </table>
  )
}
