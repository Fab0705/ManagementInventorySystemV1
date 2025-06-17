import React from 'react'
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({isOpen, onClose, title, children}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            className="bg-white rounded-xl p-6 shadow-lg w-[90%] max-w-lg relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={onClose}
              className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
