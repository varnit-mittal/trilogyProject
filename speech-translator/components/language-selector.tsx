"use client"

import { motion } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { SearchableSelect } from "@/components/searchable-select"
import { ArrowRightLeft, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

interface LanguageSelectorProps {
  sourceLanguage: string
  targetLanguage: string
  autoDetect: boolean
  onSourceLanguageChange: (value: string) => void
  onTargetLanguageChange: (value: string) => void
  onAutoDetectChange: (value: boolean) => void
}

const languages = [
  { value: "auto", label: "Auto-detect", flag: "🌐" },
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "es", label: "Spanish", flag: "🇪🇸" },
  { value: "fr", label: "French", flag: "🇫🇷" },
  { value: "de", label: "German", flag: "🇩🇪" },
  { value: "it", label: "Italian", flag: "🇮🇹" },
  { value: "pt", label: "Portuguese", flag: "🇵🇹" },
  { value: "ru", label: "Russian", flag: "🇷🇺" },
  { value: "ja", label: "Japanese", flag: "🇯🇵" },
  { value: "ko", label: "Korean", flag: "🇰🇷" },
  { value: "zh", label: "Chinese (Simplified)", flag: "🇨🇳" },
  { value: "ar", label: "Arabic", flag: "🇸🇦" },
  { value: "hi", label: "Hindi", flag: "🇮🇳" },
  { value: "th", label: "Thai", flag: "🇹🇭" },
  { value: "vi", label: "Vietnamese", flag: "🇻🇳" },
  { value: "nl", label: "Dutch", flag: "🇳🇱" },
  { value: "sv", label: "Swedish", flag: "🇸🇪" },
  { value: "no", label: "Norwegian", flag: "🇳🇴" },
  { value: "da", label: "Danish", flag: "🇩🇰" },
  { value: "fi", label: "Finnish", flag: "🇫🇮" },
]

export function LanguageSelector({
  sourceLanguage,
  targetLanguage,
  autoDetect,
  onSourceLanguageChange,
  onTargetLanguageChange,
  onAutoDetectChange,
}: LanguageSelectorProps) {
  const handleSwapLanguages = () => {
    if (sourceLanguage !== "auto") {
      onSourceLanguageChange(targetLanguage)
      onTargetLanguageChange(sourceLanguage)
    }
  }

  const targetLanguages = languages.filter((lang) => lang.value !== "auto")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Language Selection</h2>
      </div>

      {/* Auto-detect toggle */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-100 dark:border-blue-800"
      >
        <Switch
          id="auto-detect"
          checked={autoDetect}
          onCheckedChange={onAutoDetectChange}
          className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-blue-400"
        />
        <Label htmlFor="auto-detect" className="text-sm font-medium cursor-pointer select-none">
          Auto-detect source language
        </Label>
      </motion.div>

      {/* Language selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* Source Language */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">From</Label>
          <SearchableSelect
            options={languages}
            value={autoDetect ? "auto" : sourceLanguage}
            onValueChange={onSourceLanguageChange}
            disabled={autoDetect}
            placeholder="Select source language"
            searchPlaceholder="Search source languages..."
          />
        </motion.div>

        {/* Swap button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center pb-1"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSwapLanguages}
            disabled={sourceLanguage === "auto"}
            className={cn(
              "p-3 rounded-full transition-all duration-200",
              "bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50",
              "border-2 border-blue-200 dark:border-blue-700",
              "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-blue-400",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
            )}
            aria-label="Swap languages"
          >
            <ArrowRightLeft className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </motion.button>
        </motion.div>

        {/* Target Language */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">To</Label>
          <SearchableSelect
            options={targetLanguages}
            value={targetLanguage}
            onValueChange={onTargetLanguageChange}
            placeholder="Select target language"
            searchPlaceholder="Search target languages..."
          />
        </motion.div>
      </div>
    </div>
  )
}
