
import Link from "next/link";
import Header from "@/components/elements/site/header";

async function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
      <Header />
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-sky-800 mb-6">
            Master Your Knowledge with
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">
              Interactive Quizzes
            </span>
          </h1>
          
          <p className="text-xl text-sky-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of learners who are improving their skills with our comprehensive quiz platform. 
            Test your knowledge, track your progress, and achieve your learning goals.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/register"
              className="px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              Start Learning Now
            </Link>
            <Link 
              href="/login"
              className="px-8 py-4 border-2 border-sky-500 text-sky-700 rounded-lg hover:bg-sky-50 font-semibold text-lg transition-all"
            >
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-800 mb-2">10K+</div>
              <div className="text-sky-600">Active Learners</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-800 mb-2">500+</div>
              <div className="text-sky-600">Quiz Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-800 mb-2">95%</div>
              <div className="text-sky-600">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-sky-800 text-center mb-12">
            Why Choose QuizMaster?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-sky-800 mb-2">Interactive Learning</h3>
              <p className="text-sky-600">Engage with dynamic quizzes that adapt to your learning pace and style.</p>
            </div>
            
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-sky-800 mb-2">Progress Tracking</h3>
              <p className="text-sky-600">Monitor your learning journey with detailed analytics and insights.</p>
            </div>
            
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-sky-800 mb-2">Wide Range</h3>
              <p className="text-sky-600">Access quizzes across various subjects and difficulty levels.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default Home