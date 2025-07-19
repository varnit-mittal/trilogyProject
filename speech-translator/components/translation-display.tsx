"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Volume2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

interface TranslationDisplayProps {
  currentText: string
  translatedText: string
  isTranslating: boolean
  sourceLanguage: string
  targetLanguage: string
  detectedLanguage?: string
}

const languageNames: Record<string, string> = {
  auto: "Auto-detect",
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
  ar: "Arabic",
  hi: "Hindi",
  "hi-IN": "Hindi",
}

export function TranslationDisplay({
  currentText,
  translatedText,
  isTranslating,
  sourceLanguage,
  targetLanguage,
  detectedLanguage,
}: TranslationDisplayProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to your clipboard.",
    })
  }

  const speakText = (text: string, lang: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      const resolvedLang = lang === "auto" ? detectedLanguage || "en-US" : lang
      utterance.lang = resolvedLang
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Original Text */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                Original Text
                <Badge variant="secondary" className="text-xs">
                  {sourceLanguage === "auto"
                    ? `Auto: ${languageNames[detectedLanguage || ""] || detectedLanguage || "Unknown"}`
                    : languageNames[sourceLanguage]}
                </Badge>
              </CardTitle>
              {currentText && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(currentText)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => speakText(currentText, sourceLanguage)}>
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {currentText ? (
                <motion.div key={currentText} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="min-h-[120px] p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-900 dark:text-white leading-relaxed">{currentText}</p>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[120px] p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400 text-center">Start speaking to see your text here...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Translated Text */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                Translation
                <Badge variant="secondary" className="text-xs">
                  {languageNames[targetLanguage]}
                </Badge>
              </CardTitle>
              {translatedText && !isTranslating && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(translatedText)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => speakText(translatedText, targetLanguage)}>
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {isTranslating ? (
                <motion.div key="translating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-[120px] p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
                    <p className="text-blue-700 dark:text-blue-300">Translating...</p>
                  </div>
                </motion.div>
              ) : translatedText ? (
                <motion.div key={translatedText} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="min-h-[120px] p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-gray-900 dark:text-white leading-relaxed">{translatedText}</p>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[120px] p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400 text-center">Translation will appear here...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
