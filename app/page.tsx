'use client'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Github, Mail, CheckCircle, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  onAuthStateChanged 
} from 'firebase/auth'

export default function Component() {
  const router = useRouter()
  const googleProvider = new GoogleAuthProvider()
  const githubProvider = new GithubAuthProvider()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/dashboard')
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error: any) {
      console.error('Google Sign in error:', error.message)
    }
  }

  const handleGithubSignIn = async () => {
    try {
      await signInWithPopup(auth, githubProvider)
    } catch (error: any) {
      console.error('GitHub Sign in error:', error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="p-6 bg-gray-900">
        <h1 className="text-2xl font-bold">
          JobTrack<span className="text-yellow-400">r</span>
        </h1>
      </header>
      <main className="container mx-auto px-4 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="lg:w-1/2 space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              Streamline Your Job Search with JobTrack<span className="text-yellow-400">r</span>
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              Organize, track, and optimize your job applications in one place. Never miss an opportunity again.
            </p>
            <ul className="space-y-4">
              {['Track applications effortlessly', 'Set reminders for follow-ups', 'Analyze your job search metrics'].map((feature, index) => (
                <li key={index} className="flex items-center space-x-3 text-lg">
                  <CheckCircle className="text-yellow-400 h-6 w-6 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-6 px-8 text-lg transition-all duration-300 ease-in-out transform hover:scale-105 rounded-full">
              Login to Check it Out
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <Card className="lg:w-1/2 w-full bg-gray-900 border-gray-800 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8 lg:p-12 space-y-8">
              <h3 className="text-3xl font-bold text-center text-white mb-8">Get Started Now</h3>
              <div className="grid gap-6">
                <Button 
                  className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-6 text-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center rounded-xl" 
                  variant="outline"
                  onClick={handleGoogleSignIn}
                >
                  <Mail className="h-6 w-6 mr-3" />
                  <span>Sign in with Google</span>
                </Button>
                <Button 
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-6 text-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center rounded-xl" 
                  variant="outline"
                  onClick={handleGithubSignIn}
                >
                  <Github className="h-6 w-6 mr-3" />
                  <span>Sign in with GitHub</span>
                </Button>
              </div>
              <p className="text-sm text-gray-400 text-center mt-8">
                By signing in, you agree to our <a href="#" className="text-yellow-400 hover:underline">Terms of Service</a> and <a href="#" className="text-yellow-400 hover:underline">Privacy Policy</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}