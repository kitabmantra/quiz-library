"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import toast from "react-hot-toast"
import Image from "next/image"

interface ImageUploadProps {
  onImagesUploaded: (files: File[]) => void
  onGenerateFromImages: (files: File[], type: "multiple") => void
  isGenerating?: boolean
  mode: "multiple"
}

export function ImageUpload({ onImagesUploaded, onGenerateFromImages, isGenerating, mode }: ImageUploadProps) {
  const [uploadedImages, setUploadedImages] = useState<File[]>([])

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return

    const imageFiles = Array.from(files).filter(
      (file) =>
        file.type.startsWith("image/") && ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type),
    )

    if (imageFiles.length === 0) {
      toast.error("Please select valid image files (JPEG, PNG, GIF, WebP)")
      return
    }

    setUploadedImages((prev) => [...prev, ...imageFiles])
    onImagesUploaded(imageFiles)
    toast.success(`${imageFiles.length} image(s) uploaded successfully`)
  }

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleGenerate = () => {
    if (uploadedImages.length === 0) {
      toast.error("Please upload at least one image")
      return
    }
    onGenerateFromImages(uploadedImages, mode)
    setUploadedImages([])
  }

  return (
    <div className="border-2 border-dashed border-sky-300 rounded-xl p-8 bg-sky-50/50 hover:border-sky-400 transition-all duration-300">
      <div className="text-center">
        <input
          type="file"
          multiple={true}
          accept="image/*"
          onChange={(e) => handleImageUpload(e.target.files)}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <div className="mx-auto w-16 h-16 bg-sky-200 rounded-full flex items-center justify-center mb-4 hover:bg-sky-300 transition-colors">
            <ImageIcon className="w-8 h-8 text-sky-600" />
          </div>
          <p className="text-base font-semibold text-sky-700 mb-2">Upload images to generate questions</p>
          <p className="text-sm text-sky-500">Supports JPEG, PNG, GIF, WebP</p>
        </label>
      </div>

      {uploadedImages.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-sky-700">Uploaded Images ({uploadedImages.length})</span>
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating} 
              size="lg"
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isGenerating
                ? "Generating..."
                : `Generate ${uploadedImages.length} Questions`}
            </Button>
          </div>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {uploadedImages.map((file, index) => (
              <div key={index} className="relative group">
                <Image
                  src={URL.createObjectURL(file) || "/placeholder.svg"}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border-2 border-sky-200 group-hover:border-sky-400 transition-all duration-200 shadow-sm"
                  width={96}
                  height={96}
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
