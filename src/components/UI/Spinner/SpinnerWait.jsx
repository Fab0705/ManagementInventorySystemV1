import React from 'react'

export default function SpinnerWait({ withText = false, text = "Please Wait", size = "md", className = "", textClassName = "" }) {
    const sizeClasses = {
        sm: "h-4 w-4 border-2",
        md: "h-6 w-6 border-3",
        lg: "h-8 w-8 border-4"
    };
    const textSizeClasses = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base"
    };
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Spinner */}
      <div
        className={`inline-block ${sizeClasses[size]} animate-spin rounded-full border-solid border-white border-t-transparent`}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
      
      {/* Texto (opcional, al lado) */}
      {withText && (
        <span className={`text-white font-medium ${textSizeClasses[size]} ${textClassName}`}>
          {text}
        </span>
      )}
    </div>
  )
}
