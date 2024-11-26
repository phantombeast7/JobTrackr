'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { signInWithPopup, GoogleAuthProvider, GithubAuthProvider, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Github, Mail, CheckCircle, ArrowRight, BarChart2, Calendar, Layout, Briefcase, Star, X } from 'lucide-react'

const dashboard_preview = "/dashboard-preview.png"
const applications_preview = "/applications-preview.png"
const reminders_preview = "/reminders-preview.png"

const features = [
  {
    title: "Smart Dashboard",
    icon: Layout,
    description: "Centralize your job search with our intuitive dashboard. Track application statuses, upcoming tasks, and gain valuable insights into your job hunting progress. Open-source and community-driven, ensuring continuous improvements and features.",
    image: dashboard_preview,
    gradient: "from-blue-500 to-blue-700"
  },
  {
    title: "Application Management",
    icon: BarChart2,
    description: "Take control of your job applications with our comprehensive management system. Log detailed records, including company information, job descriptions, and interview notes. Collaborate with the community to enhance and customize tracking features.",
    image: applications_preview,
    gradient: "from-purple-500 to-purple-700"
  },
  {
    title: "Intelligent Reminders",
    icon: Calendar,
    description: "Never miss a deadline with our smart reminder system. Get timely notifications for follow-ups, interviews, and important tasks. Contribute to our open-source codebase to refine and expand reminder functionalities for everyone's benefit.",
    image: reminders_preview,
    gradient: "from-green-500 to-green-700"
  }
]

export default function ImprovedJobTrackr() {
  const router = useRouter()
  const googleProvider = new GoogleAuthProvider()
  const githubProvider = new GithubAuthProvider()
  const [currentFeature, setCurrentFeature] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/dashboard')
      }
    })

    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-100">
      <header className="p-6 bg-black/80 backdrop-blur-md fixed w-full z-50 transition-all duration-300 border-b border-gray-800">
        <div className="container mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <Briefcase className="h-8 w-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">
              Job<span className="text-blue-400">Track</span>
              <motion.span 
                className="text-yellow-400"
                animate={{ rotate: isHovering ? 360 : 0 }}
                transition={{ duration: 0.5 }}
              >
                r
              </motion.span>
            </h1>
          </motion.div>
          <nav className="hidden md:flex items-center space-x-6">
            <a 
              href="https://github.com/phantombeast7/JobTrackr" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <Github className="h-5 w-5" />
              <span>Star on GitHub</span>
            </a>
            <p className="text-gray-400 text-sm">Open Source & Community-Driven</p>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24">
        <section className="min-h-screen flex flex-col lg:flex-row items-center justify-center gap-16">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2 space-y-8"
          >
            <h2 className="text-5xl lg:text-7xl font-bold leading-tight text-white">
              Elevate Your
              <motion.span 
                className="block bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Job Search Game
              </motion.span>
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              JobTrackr: Your open-source companion for the modern job hunt. Organize, track, and conquer your career aspirations with the power of community-driven development.
            </p>
            <ul className="space-y-4">
              {[
                'Centralize all job applications in one place',
                'Collaborate with a global community of job seekers',
                'Customize and extend features to fit your needs',
                'Contribute to making job hunting easier for everyone'
              ].map((feature, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="flex items-center space-x-3 text-lg text-gray-200"
                >
                  <CheckCircle className="text-blue-400 h-6 w-6 flex-shrink-0" />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:w-1/2 w-full"
          >
            <Card className="bg-gray-800/90 backdrop-blur-md border border-gray-700 shadow-xl rounded-3xl overflow-hidden">
              <CardContent className="p-8 lg:p-12 space-y-8">
                <div className="flex items-center justify-center gap-3 mb-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Star className="h-8 w-8 text-yellow-400" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-center text-white">Join the Community</h3>
                </div>

                <div className="grid gap-6">
                  <motion.div 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                    onHoverStart={() => setIsHovering(true)}
                    onHoverEnd={() => setIsHovering(false)}
                  >
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold py-6 text-lg 
                               transition-all duration-300 ease-in-out transform hover:shadow-xl 
                               flex items-center justify-center rounded-xl" 
                      onClick={handleGoogleSignIn}
                    >
                      <Mail className="h-6 w-6 mr-3" />
                      Continue with Google
                    </Button>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                    onHoverStart={() => setIsHovering(true)}
                    onHoverEnd={() => setIsHovering(false)}
                  >
                    <Button 
                      className="w-full bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white font-semibold py-6 text-lg 
                               transition-all duration-300 ease-in-out transform hover:shadow-xl 
                               flex items-center justify-center rounded-xl border border-gray-600" 
                      onClick={handleGithubSignIn}
                    >
                      <Github className="h-6 w-6 mr-3" />
                      Continue with GitHub
                    </Button>
                  </motion.div>
                </div>

                <p className="text-center text-sm text-gray-400 mt-6">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <section id="features" className="py-32 bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <motion.h2 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-5xl lg:text-6xl font-bold text-center mb-16 text-white"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
                Supercharge Your Job Search
              </span>
            </motion.h2>

            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col md:flex-row items-center justify-between mb-24 gap-8"
              >
                <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                  <motion.div 
                    className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden shadow-2xl cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedImage(feature.image)}
                  >
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 transform hover:scale-110"
                    />
                  </motion.div>
                </div>
                <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                  <div className={`p-4 rounded-full w-16 h-16 mb-4 bg-gradient-to-br ${feature.gradient}`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4 text-white">{feature.title}</h3>
                  <p className="text-gray-300 text-lg mb-6">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-24 text-center"
        >
          <motion.h2 
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold mb-8 text-white"
          >
            Ready to Revolutionize Your Job Search?
          </motion.h2>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={scrollToTop}
              className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold py-6 px-12 text-lg transition-all duration-300 ease-in-out rounded-full shadow-lg hover:shadow-xl"
            >
              Get Started Now
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <ArrowRight className="ml-2 h-5 w-5" />
              </motion.div>
            </Button>
          </motion.div>
        </motion.section>
      </main>

      <footer className="bg-black/80 backdrop-blur-md py-12 mt-24 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2023 JobTrackr. All rights reserved.</p>
          <p className="mt-2">Built with ❤️ by the open-source community</p>
</div>
      </footer>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-gray-900/95 backdrop-blur-md border-none rounded-lg">
          <DialogTitle className="sr-only">Feature Preview</DialogTitle>
          <div className="relative w-full h-full">
            {selectedImage && (
              <Image
                src={selectedImage}
                alt="Feature preview"
                layout="fill"
                objectFit="contain"
                className="rounded-lg"
              />
            )}
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors bg-black/50 backdrop-blur-sm rounded-full p-2"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-8 w-8" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

