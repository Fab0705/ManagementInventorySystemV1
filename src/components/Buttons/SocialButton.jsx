import React from 'react'

export default function SocialButton({ icon, text }) {
  return (
    <button className="flex items-center justify-center gap-2 border px-4 py-2 rounded-md text-sm w-full hover:bg-gray-50 transition">
      {icon}
      {text}
    </button>
  );
}
