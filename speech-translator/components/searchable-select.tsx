"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, Search, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Option {
  value: string
  label: string
  flag?: string
  disabled?: boolean
}

interface SearchableSelectProps {
  options: Option[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  searchPlaceholder?: string
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  disabled = false,
  className,
  searchPlaceholder = "Search languages...",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const optionsRef = useRef<HTMLDivElement[]>([])

  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()))

  const selectedOption = options.find((option) => option.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm("")
        setFocusedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return

    switch (event.key) {
      case "Enter":
        event.preventDefault()
        if (isOpen && focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          onValueChange(filteredOptions[focusedIndex].value)
          setIsOpen(false)
          setSearchTerm("")
          setFocusedIndex(-1)
        } else if (!isOpen) {
          setIsOpen(true)
        }
        break
      case "Escape":
        setIsOpen(false)
        setSearchTerm("")
        setFocusedIndex(-1)
        break
      case "ArrowDown":
        event.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else {
          setFocusedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0))
        }
        break
      case "ArrowUp":
        event.preventDefault()
        if (isOpen) {
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1))
        }
        break
      case "Tab":
        setIsOpen(false)
        setSearchTerm("")
        setFocusedIndex(-1)
        break
    }
  }

  const handleOptionClick = (optionValue: string) => {
    onValueChange(optionValue)
    setIsOpen(false)
    setSearchTerm("")
    setFocusedIndex(-1)
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full justify-between h-10 px-3 py-2 text-left font-normal",
          "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-blue-400",
          "border-2 border-gray-200 dark:border-gray-600",
          "hover:border-gray-300 dark:hover:border-gray-500",
          "bg-white dark:bg-gray-800",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedOption?.flag && <span className="text-lg">{selectedOption.flag}</span>}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-80 overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-600">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  ref={searchInputRef}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setFocusedIndex(-1)
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={searchPlaceholder}
                  className="pl-10 h-8 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No languages found</div>
              ) : (
                filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    ref={(el) => {
                      if (el) optionsRef.current[index] = el
                    }}
                    role="option"
                    aria-selected={option.value === value}
                    onClick={() => !option.disabled && handleOptionClick(option.value)}
                    className={cn(
                      "relative flex items-center gap-3 px-3 py-2 cursor-pointer select-none text-sm",
                      "hover:bg-gray-100 dark:hover:bg-gray-700",
                      "focus:bg-gray-100 dark:focus:bg-gray-700",
                      focusedIndex === index && "bg-gray-100 dark:bg-gray-700",
                      option.value === value && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
                      option.disabled && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    {option.flag && <span className="text-lg flex-shrink-0">{option.flag}</span>}
                    <span className="flex-1 truncate">{option.label}</span>
                    {option.value === value && (
                      <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
