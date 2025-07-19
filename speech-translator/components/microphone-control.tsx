"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Mic, Square } from "lucide-react"

interface MicrophoneControlProps {
  isRecording: boolean
  onToggleRecording: () => void
}

export function MicrophoneControl({ isRecording, onToggleRecording }: MicrophoneControlProps) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <motion.div
        animate={{
          scale: isRecording ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 1.5,
          repeat: isRecording ? Number.POSITIVE_INFINITY : 0,
          ease: "easeInOut",
        }}
      >
        <Button
          onClick={onToggleRecording}
          size="lg"
          className={`w-20 h-20 rounded-full transition-all duration-300 ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25"
              : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25"
          }`}
        >
          <motion.div initial={false} animate={{ rotate: isRecording ? 180 : 0 }} transition={{ duration: 0.3 }}>
            {isRecording ? (
              <Square className="w-8 h-8 text-white fill-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </motion.div>
        </Button>
      </motion.div>

      {/* Recording indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isRecording ? 1 : 0 }}
        className="flex items-center gap-2"
      >
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 bg-red-500 rounded-full"
              animate={{
                height: isRecording ? [4, 16, 4] : 4,
              }}
              transition={{
                duration: 0.8,
                repeat: isRecording ? Number.POSITIVE_INFINITY : 0,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        <span className="text-sm text-red-600 dark:text-red-400 font-medium">Recording...</span>
      </motion.div>

      {/* Instructions */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-gray-600 dark:text-gray-400 max-w-xs"
      >
        {isRecording
          ? "Speak clearly into your microphone. Click to stop recording."
          : "Click the microphone to start recording your speech."}
      </motion.p>
    </div>
  )
}
