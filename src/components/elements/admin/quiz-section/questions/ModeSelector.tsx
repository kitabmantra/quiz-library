"use client"

import { Button } from "@/components/ui/button"
import { Files, Upload, Brain } from "lucide-react"
import { CreationMode } from "@/lib/types/quiz/quiz"

interface ModeSelectorProps {
  mode: CreationMode
  onModeChange: (mode: CreationMode) => void
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-sky-700">Creation Mode:</span>
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant={mode === "multiple" ? "default" : "outline"}
          onClick={() => onModeChange("multiple")}
          size="lg"
          className={`gap-3 px-6 py-3 transition-all duration-300 ${
            mode === "multiple" 
              ? "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl" 
              : "border-sky-300 hover:bg-sky-50 text-sky-700 hover:border-sky-400"
          }`}
        >
          <Files className="w-5 h-5" />
          Multiple Questions
        </Button>
        <Button
          variant={mode === "import" ? "default" : "outline"}
          onClick={() => onModeChange("import")}
          size="lg"
          className={`gap-3 px-6 py-3 transition-all duration-300 ${
            mode === "import" 
              ? "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl" 
              : "border-sky-300 hover:bg-sky-50 text-sky-700 hover:border-sky-400"
          }`}
        >
          <Upload className="w-5 h-5" />
          Import Questions
        </Button>
        <Button
          variant={mode === "ai" ? "default" : "outline"}
          onClick={() => onModeChange("ai")}
          size="lg"
          className={`gap-3 px-6 py-3 transition-all duration-300 ${
            mode === "ai" 
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl" 
              : "border-purple-300 hover:bg-purple-50 text-purple-700 hover:border-purple-400"
          }`}
        >
          <Brain className="w-5 h-5" />
          AI Generate
        </Button>
      </div>
    </div>
  )
}
