"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { HighContrastToggle } from "@/components/high-contrast-toggle"
import { Languages, Mic, Type, Zap, Globe, Shield, ArrowRight, Users, Star } from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: Mic,
    title: "Voice Translation",
    description: "Speak naturally and get instant translations with advanced speech recognition technology.",
  },
  {
    icon: Type,
    title: "Text Translation",
    description: "Type your text and translate it instantly with support for 20+ languages.",
  },
  {
    icon: Zap,
    title: "Real-time Processing",
    description: "Experience lightning-fast translations with minimal latency for seamless communication.",
  },
  {
    icon: Globe,
    title: "20+ Languages",
    description: "Support for major world languages with auto-detection and smart language switching.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your conversations stay private with client-side processing and no data storage.",
  },
  {
    icon: Users,
    title: "Accessible Design",
    description: "Built with accessibility in mind, supporting screen readers and keyboard navigation.",
  },
]

const testimonials = [
  {
    name: "Sarah Chen",
    role: "International Business",
    content:
      "This translator has revolutionized how I communicate with my global clients. The voice recognition is incredibly accurate!",
    rating: 5,
  },
  {
    name: "Miguel Rodriguez",
    role: "Travel Blogger",
    content: "Perfect for my travels! The real-time translation helps me connect with locals everywhere I go.",
    rating: 5,
  },
  {
    name: "Dr. Aisha Patel",
    role: "Medical Professional",
    content: "The accessibility features make this tool invaluable for communicating with diverse patients.",
    rating: 5,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Skip to main content link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Header */}
      <header className="relative z-10 px-4 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="p-2 bg-blue-600 rounded-lg">
              <Languages className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">SpeechTranslator</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <HighContrastToggle />
            <ThemeToggle />
          </motion.div>
        </div>
      </header>

      <main id="main-content">
        {/* Hero Section */}
        <section className="px-4 py-16 md:py-24">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Break Language Barriers
                <span className="block text-blue-600 dark:text-blue-400">Instantly</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                Translate speech and text in real-time with our advanced AI-powered translator. Support for 20+
                languages with unmatched accuracy and speed.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Link href="/translator">
                <Button size="lg" className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white">
                  Start Translating
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
                Watch Demo
              </Button>
            </motion.div>

            {/* Hero Image/Demo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative max-w-4xl mx-auto"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Live Translation</span>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-gray-900 dark:text-white">"Hello, how can I help you today?"</p>
                    </div>
                    <div className="flex justify-center">
                      <ArrowRight className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-gray-900 dark:text-white">"Hola, ¿cómo puedo ayudarte hoy?"</p>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center">
                      <Mic className="w-16 h-16 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-16 bg-white/50 dark:bg-gray-800/50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Powerful Features</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Everything you need for seamless cross-language communication
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                        <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="px-4 py-16">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">What Users Say</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">Trusted by thousands of users worldwide</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-16 bg-blue-600 dark:bg-blue-800">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start Translating?</h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of users who trust our translator for their communication needs.
              </p>
              <Link href="/translator">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-4 py-8 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Languages className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">SpeechTranslator</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            © 2025 SpeechTranslator. Breaking language barriers with AI.
          </p>
        </div>
      </footer>
    </div>
  )
}