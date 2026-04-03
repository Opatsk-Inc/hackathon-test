import React, { createContext, useContext, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { Button } from "./button"

interface ModalContextType {
  isOpen: boolean
  onClose: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error("Modal sub-components must be used within a <Modal />")
  }
  return context
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <ModalContext.Provider value={{ isOpen, onClose }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        {children}
      </div>
    </ModalContext.Provider>
  )
}

function Content({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { onClose } = useModal()
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={contentRef}
      className={`relative w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 ${className}`}
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
    >
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose} // This handles clicking outside the content area
      />
      {children}
    </div>
  )
}

function Header({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mb-4 flex items-center justify-between ${className}`}>
      {children}
    </div>
  )
}

function Title({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>
}

// 4. Close Button
function CloseButton({ className = "" }: { className?: string }) {
  const { onClose } = useModal()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClose}
      className={`text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 ${className}`}
    >
      <X className="h-4 w-4" />
    </Button>
  )
}

function Body({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`${className}`}>{children}</div>
}

function Footer({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mt-6 flex justify-end gap-2 ${className}`}>{children}</div>
}

Modal.Content = Content
Modal.Header = Header
Modal.Title = Title
Modal.CloseButton = CloseButton
Modal.Body = Body
Modal.Footer = Footer
