import Link from "next/link"
import Header from "@/components/elements/site/header"
import { getCurrentUser } from "@/lib/actions/user/get-current-user"

async function Home() {
  const user = await getCurrentUser()
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <Header />
      <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-purple-800/70 to-blue-900/80"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-purple-600/10"></div>
        </div>
    
        <div className="absolute right-8 top-20 z-10 hidden lg:block">
          <div className="relative">
            <div className="w-80 h-96 bg-white rounded-2xl shadow-2xl p-6 border-4 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="text-sm font-medium text-purple-600">Question 3/10</div>
              </div>

              <div className="space-y-4">
                <div className="h-4 bg-purple-100 rounded-full w-3/4"></div>
                <div className="h-4 bg-purple-100 rounded-full w-full"></div>
                <div className="h-4 bg-purple-100 rounded-full w-5/6"></div>

                <div className="space-y-2 mt-6">
                  <div className="h-8 bg-purple-50 border-2 border-purple-200 rounded-lg flex items-center px-3">
                    <div className="w-4 h-4 border-2 border-purple-400 rounded-full mr-3"></div>
                    <div className="h-3 bg-purple-200 rounded w-3/4"></div>
                  </div>
                  <div className="h-8 bg-purple-50 border-2 border-purple-200 rounded-lg flex items-center px-3">
                    <div className="w-4 h-4 border-2 border-purple-400 rounded-full mr-3"></div>
                    <div className="h-3 bg-purple-200 rounded w-2/3"></div>
                  </div>
                  <div className="h-8 bg-purple-50 border-2 border-purple-200 rounded-lg flex items-center px-3">
                    <div className="w-4 h-4 border-2 border-purple-400 rounded-full mr-3"></div>
                    <div className="h-3 bg-purple-200 rounded w-4/5"></div>
                  </div>
                  <div className="h-8 bg-purple-50 border-2 border-purple-200 rounded-lg flex items-center px-3">
                    <div className="w-4 h-4 border-2 border-purple-400 rounded-full mr-3"></div>
                    <div className="h-3 bg-purple-200 rounded w-1/2"></div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-purple-600">⏱️ 02:45</div>
                  <div className="w-20 h-2 bg-purple-100 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg animate-bounce">
              ✓
            </div>
            <div
              className="absolute -bottom-4 -right-4 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg animate-bounce"
              style={{ animationDelay: "0.5s" }}
            >
              ⭐
            </div>
          </div>
        </div>

        <div className="relative z-20 text-center px-8 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3 mb-8">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white font-medium">🚀 #1 Quiz Platform for Learning</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Master Your Knowledge with
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 mt-2">
              Interactive Quizzes
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join <span className="font-semibold text-yellow-300">50,000+</span> learners who are transforming their
            skills with our AI-powered quiz platform. Test your knowledge, compete with others, and achieve your
            learning goals faster than ever.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {user.user ? (
              <Link
                href="/quizzes"
                className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 font-bold text-lg transition-all shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-1"
              >
                🎯 Start Taking Quizzes
              </Link>
            ) : (
              <Link
                href="/register"
                className="group px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl hover:from-yellow-500 hover:to-orange-600 font-bold text-lg transition-all shadow-2xl hover:shadow-yellow-500/25 transform hover:-translate-y-1"
              >
                🚀 Start Learning Now - It's Free!
              </Link>
            )}
            
            {user.user ? (
              <Link
                href="/user/profile"
                className="px-8 py-4 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 font-semibold text-lg transition-all backdrop-blur-sm"
              >
                👤 My Account
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-8 py-4 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 font-semibold text-lg transition-all backdrop-blur-sm"
              >
                🔑 Sign In
              </Link>
            )}
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 text-white/80 text-sm mb-8">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Instant Access</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>24/7 Available</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">50K+</div>
              <div className="text-white/80 text-sm">Active Learners</div>
            </div>
            <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">1000+</div>
              <div className="text-white/80 text-sm">Quiz Categories</div>
            </div>
            <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">98%</div>
              <div className="text-white/80 text-sm">Success Rate</div>
            </div>
            <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">24/7</div>
              <div className="text-white/80 text-sm">Available</div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                QuizMaster
              </span>{" "}
              is Different?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've built the most advanced quiz platform that adapts to your learning style and helps you achieve your
              goals faster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group text-center p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Learning</h3>
              <p className="text-gray-600 leading-relaxed">
                Our intelligent system adapts to your performance, creating personalized quizzes that challenge you at
                the right level.
              </p>
            </div>

            <div className="group text-center p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-Time Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Track your progress with detailed insights, performance graphs, and personalized recommendations for
                improvement.
              </p>
            </div>

            <div className="group text-center p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Unlimited Access</h3>
              <p className="text-gray-600 leading-relaxed">
                Access thousands of quizzes across academic subjects, entrance exams, and competitive tests anytime,
                anywhere.
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-white">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Learning?</h3>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                {user 
                  ? "Continue your learning journey with thousands of quizzes waiting for you."
                  : "Join thousands of successful learners who have already improved their skills with QuizMaster."
                }
              </p>
              {user.user ? (
                <Link
                  href="/quizzes"
                  className="inline-block px-10 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  🎯 Take More Quizzes
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="inline-block px-10 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  🚀 Start Your Free Journey Today
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
