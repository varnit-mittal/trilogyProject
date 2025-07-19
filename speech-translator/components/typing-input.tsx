"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Send, X } from "lucide-react"

interface TypingInputProps {
  onTextChange: (text: string) => void
  placeholder?: string
}

export function TypingInput({ onTextChange, placeholder = "Type your text here..." }: TypingInputProps) {
  const [text, setText] = useState("")
  const [debouncedText, setDebouncedText] = useState("")

  // Debounce text input for real-time translation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText(text)
    }, 500)

    return () => clearTimeout(timer)
  }, [text])

  useEffect(() => {
    onTextChange(debouncedText)
  }, [debouncedText, onTextChange])

  const handleSubmit = () => {
    if (text.trim()) {
      onTextChange(text)
    }
  }

  const handleClear = () => {
    setText("")
    onTextChange("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
      <Card className="border-2 border-blue-200 dark:border-blue-700">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="min-h-[120px] resize-none text-lg leading-relaxed focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-200 dark:border-gray-600"
                aria-label="Text input for translation"
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500">
                {text.length}/1000
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl</kbd> +
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs ml-1">Enter</kbd> to translate
              </div>

              <div className="flex gap-2">
                {text && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    className="focus:ring-2 focus:ring-blue-500 bg-transparent"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
                <Button
                  onClick={handleSubmit}
                  disabled={!text.trim()}
                  size="sm"
                  className="focus:ring-2 focus:ring-blue-500"
                >
                  <Send className="w-4 h-4 mr-1" />
                  Translate
                </Button>
              </div>
            </div>

            {/* Real-time indicator */}
            {text && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Translating as you type...
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Quick phrases:</p>
        <div className="flex flex-wrap gap-2">
          {[
            "Hello, how are you?",
            "Thank you very much",
            "Where is the bathroom?",
            "How much does this cost?",
            "I need help",
          ].map((phrase) => (
            <Button
              key={phrase}
              variant="outline"
              size="sm"
              onClick={() => setText(phrase)}
              className="text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:ring-2 focus:ring-blue-500"
            >
              {phrase}
            </Button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
