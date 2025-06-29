import React from 'react';

export default function TableDetails({ theadText, tbodyData = [], renderRow, children }) {
  return (
    <table className="w-full border-separate border text-sm table-fixed">
      <thead className="bg-gray-300 border-b text-black">
        <tr>
          {theadText.map((header, index) => (
            <th key={index}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {children ? children : tbodyData.map((item, index) => renderRow(item, index))}
      </tbody>
    </table>
  );
}