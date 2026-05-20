import * as React from "react"
import { X } from "lucide-react"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

export function Dialog({ open, onOpenChange, children, className }: DialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={() => onOpenChange(false)} 
      />
      {/* Dialog content */}
      <div className={`z-10 relative shadow-xl rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 ${className || "bg-white dark:bg-slate-900"}`}>
        {children}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full p-1.5 transition-colors focus:outline-none text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  )
}

export function DialogHeader({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`flex flex-col space-y-1.5 text-center sm:text-left mb-6 ${className || ""}`}>
      {children}
    </div>
  )
}

export function DialogTitle({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <h2 className={`text-lg font-semibold leading-none tracking-tight text-slate-900 dark:text-white ${className || ""}`}>
      {children}
    </h2>
  )
}

export function DialogDescription({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <p className={`text-sm text-slate-500 dark:text-slate-400 mt-2 ${className || ""}`}>
      {children}
    </p>
  )
}
