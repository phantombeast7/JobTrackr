'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { signInWithPopup, GoogleAuthProvider, GithubAuthProvider, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Github, Mail, CheckCircle, ArrowRight, BarChart2, Calendar, Layout, Briefcase, Zap } from 'lucide-react'
import { gsap } from 'gsap'
import { FluidTransition } from '@/app/components/transitions/FluidTransition'

const dashboard_preview = "/dashboard-preview.png"
const applications_preview = "/applications-preview.png"
const reminders_preview = "/reminders-preview.png"

const features = [
  {
    title: "Smart Dashboard",
    icon: Layout,
    description: "Centralize your job search with our intuitive dashboard. Track application statuses, upcoming tasks, and gain valuable insights into your job hunting progress.",
    image: dashboard_preview,
  },
  {
    title: "Application Management",
    icon: BarChart2,
    description: "Take control of your job applications with our comprehensive management system. Log detailed records, including company information, job descriptions, and interview notes.",
    image: applications_preview,
  },
  {
    title: "Intelligent Reminders",
    icon: Calendar,
    description: "Never miss a deadline with our smart reminder system. Get timely notifications for follow-ups, interviews, and important tasks.",
    image: reminders_preview,
  }
]

export default function JobTrackLanding() {
  const router = useRouter()
  const googleProvider = new GoogleAuthProvider()
  const githubProvider = new GithubAuthProvider()
  const [isHovering, setIsHovering] = useState(false)
  const [isTransitionComplete, setIsTransitionComplete] = useState(false)

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
    <div className="min-h-screen overflow-hidden bg-white transition-colors duration-1000">
      <FluidTransition onTransitionComplete={() => setIsTransitionComplete(true)} />

      <div className="relative z-40">
        <header className="p-6 fixed w-full z-50 transition-all duration-300 border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto flex justify-between items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <Briefcase className="h-8 w-8 text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Job<span className="text-blue-400">Track</span>
                <motion.span 
                  className="text-yellow-400 inline-block"
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
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
                <span>Star on GitHub</span>
              </a>
            </nav>
          </div>
        </header>

        <main className="container mx-auto px-4 pt-24">
          <section className="min-h-screen flex flex-col lg:flex-row items-center justify-center gap-16 relative">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 space-y-8 relative z-10"
            >
              <h2 className="text-5xl lg:text-7xl font-bold leading-tight text-gray-900 dark:text-white">
                JobTrackr: Elevate Your Job Search
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Your data, your control. Securely stored and 100% customizable.
              </p>
              <ul className="space-y-4">
                {[
                  'Centralize all job applications in one place',
                  'Track your progress with intuitive visualizations',
                  'Set reminders for important deadlines',
                  'Analyze your job search performance'
                ].map((feature, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="flex items-center space-x-3 text-lg text-gray-600 dark:text-gray-300"
                  >
                    <CheckCircle className="text-blue-500 h-6 w-6 flex-shrink-0" />
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:w-1/2 w-full relative z-10"
            >
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-3xl overflow-hidden">
                <CardContent className="p-8 lg:p-12 space-y-8">
                  <div className="flex items-center justify-center gap-3 mb-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="h-8 w-8 text-blue-500" />
                    </motion.div>
                    <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Join Now</h3>
                  </div>

                  <div className="grid gap-6">
                    <motion.div 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold py-6 text-lg 
                                 transition-all duration-300 ease-in-out transform hover:shadow-xl 
                                 flex items-center justify-center rounded-xl" 
                        onClick={handleGoogleSignIn}
                      >
                        <Mail className="h-6 w-6 mr-3" />
                        Continue with Google
                      </Button>
                    </motion.div>

                    <motion.div 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-6 text-lg 
                                 transition-all duration-300 ease-in-out transform hover:shadow-xl 
                                 flex items-center justify-center rounded-xl border border-gray-300 dark:border-gray-600" 
                        onClick={handleGithubSignIn}
                      >
                        <Github className="h-6 w-6 mr-3" />
                        Continue with GitHub
                      </Button>
                    </motion.div>
                  </div>

                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          <section id="features" className="py-32 relative">
            <div className="container mx-auto px-4 relative z-10">
              <motion.h2 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-5xl lg:text-6xl font-bold text-center mb-16 text-gray-900 dark:text-white"
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-400 to-blue-500">
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
                      className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden shadow-2xl"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        layout="fill"
                        objectFit="cover"
                      />
                    </motion.div>
                  </div>
                  <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                    <div className={`p-4 rounded-full w-16 h-16 mb-4 bg-gradient-to-br from-blue-600 to-teal-500`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">{feature.description}</p>
                    <p className="text-blue-500 text-sm">Sign in to personalize and store your progress securely.</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="py-24 text-center relative z-10"
          >
            <motion.h2 
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold mb-8 text-gray-900 dark:text-white"
            >
              Ready to Revolutionize Your Job Search?
            </motion.h2>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold py-6 px-12 text-lg transition-all duration-300 ease-in-out rounded-full shadow-lg hover:shadow-xl relative overflow-hidden group"
              >
                <span className="relative z-10">Get Started Now</span>
                <span className="absolute inset-0 bg-white opacity-25 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                <motion.div
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.div>
              </Button>
            </motion.div>
          </motion.section>
        </main>

        <footer className="bg-gray-100 dark:bg-gray-900 py-12 mt-24 border-t border-gray-200 dark:border-gray-800 relative z-10">
          <div className="container mx-auto px-4 text-center">
            <motion.p 
              className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              JobTrackr – Empowering Your Career Journey. Open Source and Free.
            </motion.p>
            <motion.a 
              href="https://github.com/phantombeast7/JobTrackr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github className="h-5 w-5" />
              <span>Check out our GitHub repository to learn more or contribute</span>
            </motion.a>
          </div>
        </footer>

        <motion.div
          className="fixed bottom-4 right-4 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ArrowRight className="h-8 w-8 text-white transform rotate-[-90deg]" />
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes grain {
          0%, 100% { transform: translate(0, 0) }
          10% { transform: translate(-5%, -10%) }
          20% { transform: translate(-15%, 5%) }
          30% { transform: translate(7%, -25%) }
          40% { transform: translate(-5%, 25%) }
          50% { transform: translate(-15%, 10%) }
          60% { transform: translate(15%, 0%) }
          70% { transform: translate(0%, 15%) }
          80% { transform: translate(3%, 35%) }
          90% { transform: translate(-10%, 10%) }
        }
        
        .grain::after {
          animation: grain 8s steps(10) infinite;
          background-image: url('data:image/png;base64,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');
          content: "";
          height: 300%;
          left: -50%;
          opacity: 0.1;
          position: fixed;
          top: -100%;
          width: 300%;
        }
      `}</style>
    </div>
  )
}

