"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, Target, ArrowRight, BookOpen, Users, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

function QuizSectionPage() {
  const router = useRouter()

  const handleQuizTypeSelect = (type: "academic" | "entrance") => {
    router.push(`/quiz-section/${type}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Quiz Management
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose your quiz type to get started with creating and managing questions
            </p>
          </div>

          {/* Quiz Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Academic Quiz Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Academic Quiz</h3>
                    <p className="text-sm text-gray-500">Educational Focus</p>
                  </div>
                </div>

                <p className="text-gray-600 mb-6">
                  Create and manage educational questions for academic assessments. Build comprehensive question banks for student evaluations.
                </p>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span>Question Library</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>Student-focused</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>Timed assessments</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleQuizTypeSelect("academic")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Entrance Quiz Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Entrance Quiz</h3>
                    <p className="text-sm text-gray-500">Competitive Edge</p>
                  </div>
                </div>

                <p className="text-gray-600 mb-6">
                  Design challenging questions for competitive entrance exams. Create comprehensive question sets with advanced difficulty levels.
                </p>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Target className="w-4 h-4 text-purple-500" />
                    <span>Advanced difficulty</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span>Performance tracking</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span>Competitive evaluation</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleQuizTypeSelect("entrance")}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Section */}
          <div className="text-center mt-12">
            <p className="text-sm text-gray-500">
              Need help? Contact our support team for assistance with quiz creation and management.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizSectionPage
