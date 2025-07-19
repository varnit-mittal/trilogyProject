"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"

export function HighContrastToggle() {
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    // Check for saved high contrast preference
    const savedContrast = localStorage.getItem("high-contrast")
    if (savedContrast === "true") {
      setIsHighContrast(true)
      document.documentElement.classList.add("high-contrast")
    }
  }, [])

  const toggleHighContrast = () => {
    const newContrast = !isHighContrast
    setIsHighContrast(newContrast)

    if (newContrast) {
      document.documentElement.classList.add("high-contrast")
      localStorage.setItem("high-contrast", "true")
    } else {
      document.documentElement.classList.remove("high-contrast")
      localStorage.setItem("high-contrast", "false")
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleHighContrast}
      className="relative overflow-hidden border-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-blue-400 transition-all duration-200"
      aria-label={isHighContrast ? "Disable high contrast" : "Enable high contrast"}
      title={isHighContrast ? "Disable high contrast" : "Enable high contrast"}
    >
      <motion.div
        initial={false}
        animate={{
          scale: isHighContrast ? 0 : 1,
          rotate: isHighContrast ? 180 : 0,
          opacity: isHighContrast ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Eye className="h-4 w-4 text-gray-600 dark:text-gray-300" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          scale: isHighContrast ? 1 : 0,
          rotate: isHighContrast ? 0 : -180,
          opacity: isHighContrast ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <EyeOff className="h-4 w-4 text-black dark:text-white" />
      </motion.div>
    </Button>
  )
}
