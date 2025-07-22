"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { LanguageSelector } from "@/components/language-selector"
import { MicrophoneControl } from "@/components/microphone-control"
import { TypingInput } from "@/components/typing-input"
import { TranslationDisplay } from "@/components/translation-display"
import { ThemeToggle } from "@/components/theme-toggle"
import { HighContrastToggle } from "@/components/high-contrast-toggle"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Languages, ArrowLeft, Mic, Type, Ear } from "lucide-react"
import Link from "next/link"
import { translateText, translateSpeech } from "@/lib/api"
import he from "he"
import debounce from "lodash/debounce"

// Extend the Window interface to include webkitSpeechRecognition for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export default function TranslatorPage() {
  const [sourceLanguage, setSourceLanguage] = useState("en-US")
  const [targetLanguage, setTargetLanguage] = useState("es")
  const [isRecording, setIsRecording] = useState(false)
  const [currentText, setCurrentText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [autoDetect, setAutoDetect] = useState(true)
  const [detectedLanguage, setDetectedLanguage] = useState("auto")
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice")
  const [wakeWordStatus, setWakeWordStatus] = useState("Initializing...")

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const isComponentMounted = useRef(true);

  // --- EFFECT 1: Text Translation Debouncing ---
  const debouncedTranslateText = useRef(
    debounce(async (text: string, srcLang: string, tgtLang: string, auto: boolean) => {
      if (!text.trim()) {
        setTranslatedText("")
        return
      }
      setIsTranslating(true)
      try {
        const res = await translateText(text, tgtLang, auto ? "auto" : srcLang)
        setTranslatedText(he.decode(res.translation))
        setDetectedLanguage(res.detected_language || "auto")
      } catch (err) {
        console.error("Text translation error:", err)
        setTranslatedText("[Error in translation]")
      } finally {
        setIsTranslating(false)
      }
    }, 600)
  ).current

  useEffect(() => {
    // Cleanup debounce on unmount
    return () => debouncedTranslateText.cancel()
  }, [debouncedTranslateText])

  const handleTextTranslation = (text: string) => {
    setCurrentText(text)
    debouncedTranslateText(text, sourceLanguage, targetLanguage, autoDetect)
  }

  useEffect(() => {
    if (currentText.trim()) {
      handleTextTranslation(currentText)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetLanguage])


  // --- EFFECT 2: Main Speech Translation Trigger ---
  useEffect(() => {
    if (!isRecording) return

    const runSpeechTranslation = async () => {
      setIsTranslating(true)
      setWakeWordStatus("Listening & Translating...")
      try {
        const result = await translateSpeech(autoDetect ? "auto" : sourceLanguage, targetLanguage)
        setCurrentText(result.transcript)
        setTranslatedText(he.decode(result.translation))
        setDetectedLanguage(result.source_language || "auto")
      } catch (err) {
        console.error("Speech translation error:", err)
        if (err instanceof Error && err.message === "No speech detected.") {
          setCurrentText("No speech was detected. Please try again.")
        } else {
          setCurrentText("[Speech translation failed]")
        }
        setTranslatedText("")
      } finally {
        setIsTranslating(false)
        setIsRecording(false) // This is key to re-activate the wake word listener
      }
    }
    
    runSpeechTranslation()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording])

  // --- EFFECT 3: Initialize and Cleanup Wake Word Listener ---
  useEffect(() => {
    isComponentMounted.current = true;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setWakeWordStatus("Browser not supported.")
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US" // Wake word is in English

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("")

      if (transcript.toLowerCase().includes("jarvis")) {
        // Use a function for setIsRecording to get the latest state and prevent race conditions
        setIsRecording(current => {
          if (!current) { // Only trigger if not already recording
            console.log("Wake word detected!")
            return true
          }
          return current
        })
      }
    }
    
    recognition.onerror = (event) => {
      // console.error("Wake word error:", event.error)
      if (event.error === "not-allowed") {
        setWakeWordStatus("Mic permission needed for 'Jarvis'.")
      }
    }

    // This is crucial for reliability. If the listener stops, restart it.
    recognition.onend = () => {
      if (isComponentMounted.current && inputMode === 'voice' && !isRecording) {
        console.log("Wake word listener ended, restarting...");
        setWakeWordStatus("Listener restarting...")
        try {
          recognition.start();
        } catch (e) {
          console.error("Error restarting recognition:", e)
        }
      }
    };

    // Cleanup on component unmount
    return () => {
      isComponentMounted.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        console.log("Wake word listener cleaned up.")
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty array ensures this runs only once on mount

  // --- EFFECT 4: Control Wake Word Listener (Start/Stop) ---
  useEffect(() => {
    const recognition = recognitionRef.current
    if (!recognition) return

    // Stop listening if we switch to text mode or start active recording
    if (inputMode === "text" || isRecording) {
      recognition.stop()
    } 
    // Start listening if we are in voice mode and not recording
    else if (inputMode === "voice" && !isRecording) {
      try {
        recognition.start()
        setWakeWordStatus("Ready. Say 'Jarvis' to translate.")
      } catch (e) {
        // Catches error if recognition is already started, which is fine.
        console.log("Recognition already started.")
      }
    }
  }, [inputMode, isRecording])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div id="main-content" className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="icon" className="focus:ring-2 focus:ring-blue-500 bg-transparent">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 rounded-xl">
                  <Languages className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Real-time Translator</h1>
                  <p className="text-gray-600 dark:text-gray-400">Speak, type, or just say "Jarvis" to translate</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <HighContrastToggle />
              <ThemeToggle />
            </div>
        </motion.div>

        {/* Language Selector */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6">
            <LanguageSelector
              sourceLanguage={sourceLanguage}
              targetLanguage={targetLanguage}
              autoDetect={autoDetect}
              onSourceLanguageChange={setSourceLanguage}
              onTargetLanguageChange={setTargetLanguage}
              onAutoDetectChange={setAutoDetect}
            />
          </Card>
        </motion.div>

        {/* Input Mode Toggle */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-center">
          <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 border-2 border-gray-200 dark:border-gray-600">
            <Button variant={inputMode === "voice" ? "default" : "ghost"} size="sm" onClick={() => setInputMode("voice")} className="flex items-center gap-2">
              <Mic className="w-4 h-4" /> Voice
            </Button>
            <Button variant={inputMode === "text" ? "default" : "ghost"} size="sm" onClick={() => setInputMode("text")} className="flex items-center gap-2">
              <Type className="w-4 h-4" /> Text
            </Button>
          </div>
        </motion.div>

        {/* Main Input Control */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="flex justify-center">
          {inputMode === "voice" ? (
            <MicrophoneControl isRecording={isRecording} onToggleRecording={() => setIsRecording(!isRecording)} />
          ) : (
            <TypingInput onTextChange={handleTextTranslation} placeholder="Type your text here to translate..." />
          )}
        </motion.div>

        {/* Translation Display */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <TranslationDisplay
            currentText={currentText}
            translatedText={translatedText}
            isTranslating={isTranslating}
            sourceLanguage={autoDetect ? "auto" : sourceLanguage}
            targetLanguage={targetLanguage}
            detectedLanguage={autoDetect ? detectedLanguage : undefined}
          />
        </motion.div>

        {/* Status Indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-full backdrop-blur-sm">
            {inputMode === "voice" ? (
              <>
                <Ear className={`w-4 h-4 ${!isRecording ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
                <span className="text-sm text-gray-600 dark:text-gray-400">{wakeWordStatus}</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Type to translate</span>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}