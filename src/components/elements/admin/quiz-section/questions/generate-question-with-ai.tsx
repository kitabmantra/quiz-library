"use client"
import React, { useState, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, FileText,  Image, FileText as FilePdf, Trash2, Edit, Plus, Check, Settings } from "lucide-react"
import toast from "react-hot-toast"
import { QuestionData } from "@/lib/types/quiz/quiz"
import { extractQuestionsFromText } from "@/lib/actions/ai/extract-question"
import { extractQuestionsFromImage } from "@/lib/actions/ai/extract-question-from-image"
import { useUploadThing } from '@/lib/utils/uploadthing-client'
import { removeMultipleImages } from '@/lib/actions/uploadthing/delete-images'

interface GenerateQuestionWithAIProps {
  onQuestionsGenerated: (questions: QuestionData[]) => void
  onAddToManualList: (questions: QuestionData[]) => void
  isSaving: boolean
  manualQuestionsCount?: number // Add this to track manual questions count
}

function GenerateQuestionWithAI({ onQuestionsGenerated, onAddToManualList, isSaving, manualQuestionsCount = 0 }: GenerateQuestionWithAIProps) {
  const [isExtractingFromPDF, setIsExtractingFromPDF] = useState(false)
  const [isExtractingFromImage, setIsExtractingFromImage] = useState(false)
  const [isGeneratingFromText, setIsGeneratingFromText] = useState(false)
  const [extractedText, setExtractedText] = useState("")
  const [aiPrompt, setAiPrompt] = useState("")
  const [textGenerationPrompt, setTextGenerationPrompt] = useState("")
  const [imageGenerationPrompt, setImageGenerationPrompt] = useState("")
  const [customSubjectName, setCustomSubjectName] = useState("")
  const [customTags, setCustomTags] = useState("")
  const [showCustomSettings, setShowCustomSettings] = useState(false)
  const [editableExtractedText, setEditableExtractedText] = useState("") // New state for editable text
  const [isEditingText, setIsEditingText] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<QuestionData[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<QuestionData | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string>('')
  const [addedQuestionIds, setAddedQuestionIds] = useState<Set<string>>(new Set())
  const { startUpload } = useUploadThing("imageUploader")

  // Helper function to generate unique ID for a question
  const generateQuestionId = useCallback((question: QuestionData, index: number) => {
    return `${question.question.substring(0, 50)}_${index}`
  }, [])

  // Validation function similar to create-quesiton-main-page.tsx
  const validateQuestion = useCallback((data: QuestionData): string | null => {
    if (!data.question.trim()) return "Question is required"
    if (data.question.length < 5 || data.question.length > 1000) {
      return "Question must be between 5 and 1000 characters"
    }
    if (data.options.some((option) => !option.trim())) return "All options are required"
    if (data.correctAnswer === -1) return "Please select a correct answer"
    if (data.tags.length === 0) return "At least one tag is required"
    if (data.tags.length > 5) return "Maximum 5 tags allowed"
    if (!data.subjectName.trim()) return "Subject name is required"
    return null
  }, [])

  // Reset added questions tracking when manual list is cleared
  useEffect(() => {
    if (manualQuestionsCount === 0 && addedQuestionIds.size > 0) {
      setAddedQuestionIds(new Set())
      console.log("Manual questions cleared, resetting added questions tracking")
    }
  }, [manualQuestionsCount, addedQuestionIds.size])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setExtractedText('');
      setGeneratedQuestions([]);
      setAddedQuestionIds(new Set()); // Reset added questions tracking
    }
  }, [])

  const handleImageFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setError('');
      setExtractedText('');
      setGeneratedQuestions([]);
      setAddedQuestionIds(new Set()); // Reset added questions tracking
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [])

  const handleExtractFromFile = useCallback(async () => {
    if (!selectedFile) {
      setError(`Please select a PDF file first`);
      return;
    }

    setIsExtractingFromPDF(true)

    setError('');
    setExtractedText('');
    setGeneratedQuestions([]);
    setAddedQuestionIds(new Set()); // Reset added questions tracking

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.text) {
        setExtractedText(result.text);
        setEditableExtractedText(result.text); // Set editable text to extracted text
        toast.success(`Text extracted from PDF successfully!`);
      } else {
        throw new Error(result.error || `Failed to extract text from PDF`);
      }
    } catch (error) {
      console.error(`Error extracting from PDF:`, error);
      setError(`Failed to extract text from PDF. Please try again.`);
      toast.error(`Failed to extract text from PDF. Please try again.`);
    } finally {
      setIsExtractingFromPDF(false)
    }
  }, [selectedFile])

  const handleExtractFromImage = useCallback(async () => {
    if (!selectedImageFile) {
      setError(`Please select an image file first`);
      return;
    }

    setIsExtractingFromImage(true)

    setError('');
    setExtractedText('');
    setGeneratedQuestions([]);
    setAddedQuestionIds(new Set()); // Reset added questions tracking
    let uploadedImage : string | undefined ;
    

    try {

        const uploadResults = await startUpload([selectedImageFile])
        if(uploadResults){
            uploadedImage = uploadResults[0].ufsUrl
        }else{
            throw new Error("Failed to upload image")
        }
        
        // Use real AI extraction instead of dummy
        const questions = await extractQuestionsFromImage(uploadedImage, imageGenerationPrompt);
        
        // Apply custom subject name and tags if provided
        const processedQuestions = questions.map(question => {
          const updatedQuestion = { ...question }
          
          if (showCustomSettings && customSubjectName.trim()) {
            updatedQuestion.subjectName = customSubjectName.trim()
          }
          
          if (showCustomSettings && customTags.trim()) {
            const tags = customTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
            if (tags.length > 0) {
              // Combine custom tags with AI-generated tags, ensuring max 5
              const combinedTags = [...new Set([...tags, ...question.tags])].slice(0, 5)
              updatedQuestion.tags = combinedTags
            }
          }
          
          return updatedQuestion
        })
        
        setGeneratedQuestions(processedQuestions)
        onQuestionsGenerated(processedQuestions)
        
        toast.success(`${processedQuestions.length} questions generated from image successfully!`)
    } catch (error) {
      console.error(`Error extracting from image:`, error);
      setError(`Failed to extract text from image. Please try again.`);
      toast.error(`Failed to extract text from image. Please try again.`);
    } finally {
      setIsExtractingFromImage(false)
      if(uploadedImage && uploadedImage.length > 0){
        await removeMultipleImages([uploadedImage])
      }
    }
  }, [selectedImageFile, imageGenerationPrompt, onQuestionsGenerated, showCustomSettings, customSubjectName, customTags, startUpload])

  const handleGenerateFromText = useCallback(async () => {
    if (!editableExtractedText.trim()) {
      toast.error("Please extract text from PDF first")
      return
    }

    setIsGeneratingFromText(true)
    try {
      // Create custom prompt with user preferences
      let customPrompt = editableExtractedText
      
      // Add optional text generation prompt if provided
      if (textGenerationPrompt.trim()) {
        customPrompt += `\n\nAdditional Instructions: ${textGenerationPrompt.trim()}`
      }
      
      if (showCustomSettings) {
        let additionalInstructions = ""
        
        if (customSubjectName.trim()) {
          additionalInstructions += `\n\nIMPORTANT: Set the subject name to "${customSubjectName.trim()}" for all questions.`
        }
        
        if (customTags.trim()) {
          const tags = customTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
          if (tags.length > 0) {
            additionalInstructions += `\n\nIMPORTANT: Use these specific tags for all questions: ${tags.join(', ')}. Maximum 5 tags allowed.`
          }
        }
        
        if (additionalInstructions) {
          customPrompt += additionalInstructions
        }
      }
      
      const questions = await extractQuestionsFromText(customPrompt, textGenerationPrompt)
      
      // Apply custom subject name and tags if provided
      const processedQuestions = questions.map(question => {
        const updatedQuestion = { ...question }
        
        if (showCustomSettings && customSubjectName.trim()) {
          updatedQuestion.subjectName = customSubjectName.trim()
        }
        
        if (showCustomSettings && customTags.trim()) {
          const tags = customTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
          if (tags.length > 0) {
            // Combine custom tags with AI-generated tags, ensuring max 5
            const combinedTags = [...new Set([...tags, ...question.tags])].slice(0, 5)
            updatedQuestion.tags = combinedTags
          }
        }
        
        return updatedQuestion
      })
      
      setGeneratedQuestions(processedQuestions)
      onQuestionsGenerated(processedQuestions)
      
      toast.success(`${processedQuestions.length} questions generated successfully!`)
    } catch (error) {
      console.error('AI generation error:', error)
      setError('Text extracted successfully, but AI question generation failed')
      toast.error('Failed to generate questions from text')
    } finally {
      setIsGeneratingFromText(false)
    }
  }, [editableExtractedText, textGenerationPrompt, onQuestionsGenerated, showCustomSettings, customSubjectName, customTags])

  const handleGenerateFromPrompt = useCallback(async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt for AI generation")
      return
    }

    setIsGeneratingFromText(true)
    try {
      // Create custom prompt with user preferences
      let customPrompt = aiPrompt
      
      if (showCustomSettings) {
        let additionalInstructions = ""
        
        if (customSubjectName.trim()) {
          additionalInstructions += `\n\nIMPORTANT: Set the subject name to "${customSubjectName.trim()}" for all questions.`
        }
        
        if (customTags.trim()) {
          const tags = customTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
          if (tags.length > 0) {
            additionalInstructions += `\n\nIMPORTANT: Use these specific tags for all questions: ${tags.join(', ')}. Maximum 5 tags allowed.`
          }
        }
        
        if (additionalInstructions) {
          customPrompt += additionalInstructions
        }
      }
      
      const questions = await extractQuestionsFromText(customPrompt, aiPrompt)
      
      // Apply custom subject name and tags if provided
      const processedQuestions = questions.map(question => {
        const updatedQuestion = { ...question }
        
        if (showCustomSettings && customSubjectName.trim()) {
          updatedQuestion.subjectName = customSubjectName.trim()
        }
        
        if (showCustomSettings && customTags.trim()) {
          const tags = customTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
          if (tags.length > 0) {
            // Combine custom tags with AI-generated tags, ensuring max 5
            const combinedTags = [...new Set([...tags, ...question.tags])].slice(0, 5)
            updatedQuestion.tags = combinedTags
          }
        }
        
        return updatedQuestion
      })
      
      setGeneratedQuestions(processedQuestions)
      onQuestionsGenerated(processedQuestions)
      
      toast.success(`${processedQuestions.length} questions generated from prompt successfully!`)
      setAiPrompt("")
    } catch (error) {
      console.error('AI generation error:', error)
      toast.error('Failed to generate questions from prompt')
    } finally {
      setIsGeneratingFromText(false)
    }
  }, [aiPrompt, onQuestionsGenerated, showCustomSettings, customSubjectName, customTags])





  const handleRemoveQuestion = useCallback((index: number) => {
    setGeneratedQuestions(prev => prev.filter((_, i) => i !== index))
    if (editingIndex === index) {
      setEditingIndex(null)
      setEditingQuestion(null)
    }
    toast.success("Question removed")
  }, [editingIndex])

  const handleRemoveAllQuestions = useCallback(() => {
    if (generatedQuestions.length === 0) {
      toast.error("No questions to remove")
      return
    }
    
    setGeneratedQuestions([])
    setAddedQuestionIds(new Set())
    setEditingIndex(null)
    setEditingQuestion(null)
    toast.success("All questions removed")
  }, [generatedQuestions])

  const handleAddAllToManual = useCallback(() => {
    if (generatedQuestions.length === 0) {
      toast.error("No questions to add")
      return
    }

    // Validate all questions before adding
    const validQuestions = generatedQuestions.filter(question => {
      const validationError = validateQuestion(question)
      if (validationError) {
        toast.error(`Question "${question.question.substring(0, 50)}..." - ${validationError}`)
        return false
      }
      return true
    })

    if (validQuestions.length === 0) {
      toast.error("No valid questions to add")
      return
    }

    // Filter out questions that are already added
    const questionsToAdd = validQuestions.filter((question, index) => {
      const questionId = generateQuestionId(question, index)
      return !addedQuestionIds.has(questionId)
    })

    if (questionsToAdd.length === 0) {
      toast.error("All questions are already added to the manual list")
      return
    }

    onAddToManualList(questionsToAdd)
    
    // Mark newly added questions as added
    const newAddedIds = new Set(addedQuestionIds)
    questionsToAdd.forEach((question, index) => {
      const questionId = generateQuestionId(question, index)
      newAddedIds.add(questionId)
    })
    setAddedQuestionIds(newAddedIds)
  }, [generatedQuestions, onAddToManualList, addedQuestionIds, generateQuestionId, validateQuestion])

  const handleAddSingleQuestion = useCallback((question: QuestionData, index: number) => {
    // Validate the question before adding
    const validationError = validateQuestion(question)
    if (validationError) {
      toast.error(validationError)
      return
    }
    
    const questionId = generateQuestionId(question, index);
    if (addedQuestionIds.has(questionId)) {
      toast.error("This question is already added to the manual list.");
      return;
    }

    onAddToManualList([question]);
    setAddedQuestionIds(prev => new Set(prev).add(questionId));
  }, [onAddToManualList, addedQuestionIds, generateQuestionId, validateQuestion]);

  const isQuestionAdded = useCallback((question: QuestionData, index: number) => {
    const questionId = generateQuestionId(question, index)
    return addedQuestionIds.has(questionId)
  }, [addedQuestionIds, generateQuestionId])

    return (
    <div className="space-y-6 sm:space-y-8">
      {/* File Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* PDF Upload */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <FilePdf className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              Extract from PDF
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-4">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor="pdf-file" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Select PDF File
                  </label>
                  <input
                    id="pdf-file"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e)}
                    className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                
                {selectedFile && (
                  <div className="text-xs sm:text-sm text-gray-600">
                    <p>Selected: {selectedFile.name}</p>
                    <p>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
                
                <Button
                  onClick={() => handleExtractFromFile()}
                  disabled={!selectedFile || isExtractingFromPDF}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-xs sm:text-sm py-2"
                >
                  {isExtractingFromPDF ? "Extracting..." : "Extract Text from PDF"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Image className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              Extract from Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-4">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor="image-file" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Select Image File
                  </label>
                  <input
                    id="image-file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileChange(e)}
                    className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                </div>
                
                {selectedImageFile && (
                  <div className="text-xs sm:text-sm text-gray-600">
                    <p>Selected: {selectedImageFile.name}</p>
                    <p>Size: {(selectedImageFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-3">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Image Preview:
                    </label>
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Selected image preview"
                        className="w-full h-32 sm:h-40 object-contain border border-gray-200 rounded-lg bg-gray-50"
                      />
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedImageFile(null);
                            setImagePreview(null);
                          }}
                          className="h-6 w-6 p-0 bg-white/80 hover:bg-white text-red-600 border-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Image Generation Prompt */}
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-2 block text-gray-700">
                    Optional Instructions for Image Analysis (Optional):
                  </label>
                  <Textarea
                    placeholder="e.g., Focus on programming concepts, Generate questions about algorithms, Make questions more challenging..."
                    value={imageGenerationPrompt}
                    onChange={(e) => setImageGenerationPrompt(e.target.value)}
                    rows={2}
                    className="resize-none text-xs sm:text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Add specific instructions to customize how questions are generated from the image
                  </p>
                </div>
                
                <Button
                  onClick={() => handleExtractFromImage()}
                  disabled={!selectedImageFile || isExtractingFromImage}
                  className="w-full bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-xs sm:text-sm py-2"
                >
                  {isExtractingFromImage ? "Generating Questions..." : "Generate Questions from Image"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Extracted Text Display */}
      {extractedText && (
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Extracted Text
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isEditingText) {
                    setEditableExtractedText(editableExtractedText)
                    toast.success("Text saved!")
                  }
                  setIsEditingText(!isEditingText)
                }}
                className="text-xs sm:text-sm"
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {isEditingText ? 'Save' : 'Edit'} Text
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isEditingText ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Edit Extracted Text:</span>
                    <span className="text-xs text-gray-500">
                      {editableExtractedText.length} characters
                    </span>
                  </div>
                  <Textarea
                    value={editableExtractedText}
                    onChange={(e) => setEditableExtractedText(e.target.value)}
                    rows={8}
                    className="resize-none text-xs sm:text-sm font-mono"
                    placeholder="Edit the extracted text here..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setEditableExtractedText(extractedText) // Reset to original
                      setIsEditingText(false)
                      toast.success("Text reset to original!")
                    }}
                    variant="outline"
                    className="text-xs sm:text-sm"
                  >
                    Reset to Original
                  </Button>
                  <Button
                    onClick={() => setIsEditingText(false)}
                    className="text-xs sm:text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 max-h-32 sm:max-h-48 overflow-y-auto">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Extracted Text:</span>
                  <span className="text-xs text-gray-500">
                    {editableExtractedText.length} characters
                  </span>
                </div>
                <pre className="whitespace-pre-wrap text-xs sm:text-sm text-gray-800 font-mono">
                  {editableExtractedText}
                </pre>
              </div>
            )}
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-medium mb-2 block text-gray-700">
                  Optional Additional Instructions (Optional):
                </label>
                <Textarea
                  placeholder="e.g., Focus on programming concepts, Generate questions about algorithms, Make questions more challenging..."
                  value={textGenerationPrompt}
                  onChange={(e) => setTextGenerationPrompt(e.target.value)}
                  rows={2}
                  className="resize-none text-xs sm:text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add specific instructions to customize how questions are generated from the extracted text
                </p>
              </div>
              <Button
                onClick={handleGenerateFromText}
                disabled={isGeneratingFromText}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm py-2"
              >
                {isGeneratingFromText ? "Generating Questions..." : "Generate Questions from Text"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="pt-4 sm:pt-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <p className="text-red-800 font-medium text-xs sm:text-sm">Error:</p>
              <p className="text-red-700 text-xs sm:text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Prompt Generation */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              AI Prompt Generation
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustomSettings(!showCustomSettings)}
              className="text-xs sm:text-sm"
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              {showCustomSettings ? 'Hide' : 'Show'} Settings
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {/* Custom Settings */}
          {showCustomSettings && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-medium mb-2 block text-gray-700">
                  Custom Subject Name (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g., Computer Science, Mathematics, Physics..."
                  value={customSubjectName}
                  onChange={(e) => setCustomSubjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will override the AI-generated subject name for all questions
                </p>
              </div>
              
              <div>
                <label className="text-xs sm:text-sm font-medium mb-2 block text-gray-700">
                  Custom Tags (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g., programming, algorithms, data-structures (comma-separated)"
                  value={customTags}
                  onChange={(e) => setCustomTags(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  These tags will be combined with AI-generated tags (max 5 total)
                </p>
              </div>
            </div>
          )}
          
          <div>
            <label className="text-xs sm:text-sm font-medium mb-2 block text-gray-700">
              Describe what kind of questions you want to generate:
            </label>
            <Textarea
              placeholder="e.g., Generate 5 multiple choice questions about JavaScript fundamentals, covering variables, functions, and arrays..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={3}
              className="resize-none text-xs sm:text-sm"
            />
          </div>
          <Button
            onClick={handleGenerateFromPrompt}
            disabled={isGeneratingFromText || !aiPrompt.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm py-2"
          >
            {isGeneratingFromText ? "Generating Questions..." : "Generate Questions with AI"}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Questions List */}
      {generatedQuestions.length > 0 && (
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />
                Generated Questions ({generatedQuestions.length})
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  onClick={handleRemoveAllQuestions}
                  disabled={isSaving}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm py-2"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Remove All
                </Button>
                <Button
                  onClick={handleAddAllToManual}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm py-2"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Add All to Manual List
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
              {generatedQuestions.map((question, index) => (
                <div key={index} className={`border rounded-lg p-3 sm:p-4 ${
                  isQuestionAdded(question, index) 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-medium text-xs sm:text-sm ${
                        isQuestionAdded(question, index) ? 'text-green-800' : 'text-gray-800'
                      }`}>
                        Question {index + 1}
                      </h3>
                      {isQuestionAdded(question, index) && (
                        <div className="flex items-center gap-1 text-green-600">
                          <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs">Added</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                        {question.difficulty}
                      </span>
                      <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                        Priority: {question.priority}
                      </span>
                      <div className="flex gap-1 sm:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveQuestion(index)}
                          className="h-6 sm:h-8 px-2 text-red-600 hover:text-red-700 text-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddSingleQuestion(question, index)}
                          disabled={isQuestionAdded(question, index) || isSaving}
                          className={`h-6 sm:h-8 px-2 text-xs ${
                            isQuestionAdded(question, index)
                              ? 'bg-green-100 text-green-700 border-green-300 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                          }`}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {isQuestionAdded(question, index) ? 'Added' : 'Add'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-gray-800 mb-3">{question.question}</p>
                  
                  <div className="space-y-1 mb-3">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className={`text-xs sm:text-sm p-2 rounded ${
                        optIndex === question.correctAnswer 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {String.fromCharCode(65 + optIndex)}. {option}
                        {optIndex === question.correctAnswer && ' ✓'}
                      </div>
                    ))}
                  </div>
                  
                  {question.hint && (
                    <p className="text-xs text-gray-600 mb-2">
                      <strong>Hint:</strong> {question.hint}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {question.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Subject: {question.subjectName}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading States */}
      {(isExtractingFromPDF || isExtractingFromImage || isGeneratingFromText) && (
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-center p-6 sm:p-8">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-xs sm:text-sm">
                {isExtractingFromPDF && "Extracting from PDF..."}
                {isExtractingFromImage && "Extracting from Image..."}
                {isGeneratingFromText && "Generating questions..."}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default GenerateQuestionWithAI
