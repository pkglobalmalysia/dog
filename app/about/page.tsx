"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useAnimation, useInView } from "framer-motion"
import {
  BookOpen,
  CheckCircle,
  GraduationCap,
  Globe,
  Menu,
  X,
  Facebook,
  Twitter,
  Instagram,
  LinkedinIcon as LinkedIn,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Users,
  Award,
  Briefcase,
  Building,
  Shield,
  Snowflake,
  Zap,
  Car,
  HeadphonesIcon,
  FileText,
  ShoppingBag,
  MessageCircle,
  Brain,
  BarChart,
  Lock,
} from "lucide-react"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
}

// Section component with animation
interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  id?: string
}

const AnimatedSection = ({ children, className = "", delay = 0}: AnimatedSectionProps) => {
  const controls = useAnimation()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delay,
            staggerChildren: 0.2,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

// Stats counter component
interface CounterAnimationProps {
  target: number | string
  duration?: number
  title: string
  suffix?: string
}

const CounterAnimation = ({ target, duration = 2000, title, suffix = "" }: CounterAnimationProps) => {
  const [count, setCount] = useState(0)
  const counterRef = useRef(null)
  const inView = useInView(counterRef, { once: true })

  useEffect(() => {
    if (inView) {
      let start = 0
      const end = Number.parseInt(String(target))
      const increment = end / (duration / 16) // 60fps

      const timer = setInterval(() => {
        start += increment
        setCount(Math.floor(start))

        if (start >= end) {
          setCount(end)
          clearInterval(timer)
        }
      }, 16)

      return () => clearInterval(timer)
    }
  }, [inView, target, duration])

  return (
    <div ref={counterRef} className="text-center">
      <div className="relative mb-4">
        <div className="w-24 h-24 rounded-full bg-yellow-400 flex items-center justify-center mx-auto">
          <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center text-3xl font-bold text-transparent bg-clip-text bg-white">
            {count}
            {suffix}
          </div>
        </div>
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  )
}

// Team member card component
interface TeamMemberCardProps {
  image: string
  name: string
  role: string
  description: string
}

const TeamMemberCard = ({ image, name, role, description }: TeamMemberCardProps) => (
  <motion.div
    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden group"
    whileHover={{ y: -5 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    <div className="relative h-64 overflow-hidden">
      <Image
        src={image || "/placeholder.svg"}
        alt={name}
        fill
        className="object-fill group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
        <div className="p-4 text-white">
          <div className="flex space-x-3 mb-2">
            <a href="#" className="hover:text-yellow-400 transition-colors">
              <LinkedIn className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-yellow-400 transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-yellow-400 transition-colors">
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
    <div className="p-6">
      <h3 className="text-xl font-bold mb-1">{name}</h3>
      <p className="text-yellow-400 dark:text-yellow-400 mb-3">{role}</p>
      <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
    </div>
  </motion.div>
)

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const stagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <BookOpen className="h-8 w-8 text-yellow-400" />
                <span className="ml-2 text-xl font-bold">PK International</span>
              </Link>
              <div className="hidden md:flex ml-10 space-x-8">
                <Link
                  href="/"
                  className="text-gray-300 hover:text-yellow-400 font-medium transition-colors duration-200"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="text-white hover:text-yellow-400 font-medium border-b-2 border-yellow-400 pb-1 transition-colors duration-200"
                >
                  About
                </Link>
                <Link
                  href="/programs"
                  className="text-gray-300 hover:text-yellow-400 font-medium transition-colors duration-200"
                >
                  Programs
                </Link>
                <Link
                  href="/events"
                  className="text-gray-300 hover:text-yellow-400 font-medium transition-colors duration-200"
                >
                  Events
                </Link>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login" className="text-white hover:text-yellow-400 transition-colors duration-200">
                Sign In
              </Link>
              <Link
                href="/signup/student"
                className="bg-gradient-to-r from-yellow-400 to-yellow-400 hover:from-yellow-400 hover:to-yellow-400 text-yellow-900 font-medium px-4 py-2 rounded-md transition-all duration-200 hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:text-yellow-400 transition-colors duration-200"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black border-t border-yellow-800 py-4"
          >
            <div className="px-4 space-y-3">
              <Link
                href="/"
                className="block text-gray-300 hover:text-yellow-400 font-medium transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/about"
                className="block text-white hover:text-yellow-400 font-medium transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/programs"
                className="block text-gray-300 hover:text-yellow-400 font-medium transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Programs
              </Link>
              <Link
                href="/events"
                className="block text-gray-300 hover:text-yellow-400 font-medium transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Events
              </Link>
              <div className="pt-4 flex flex-col space-y-3">
                <Link
                  href="/login"
                  className="text-white hover:text-yellow-400 transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup/student"
                  className="bg-gradient-to-r from-yellow-400 to-yellow-400 hover:from-yellow-400 hover:to-yellow-400 text-yellow-900 font-medium px-4 py-2 rounded-md transition-all duration-200 hover:shadow-lg inline-block text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
    <section className="relative bg-cover bg-center h-[70vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <video autoPlay muted loop className="absolute min-w-full min-h-full object-cover">
            <source src="/placeholder.svg?height=800&width=1600" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              About{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-400">
                PK International
              </span>
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-yellow-400 my-6"></div>
            <p className="text-xl text-gray-200 max-w-2xl">
              Driving transformation, empowerment, and progress globally through innovative English language education
              and professional development programs.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <motion.a
                href="#our-story"
                className="bg-yellow-400 text-black px-6 py-3 rounded-md font-medium flex items-center hover:bg-gray-100 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More <ChevronRight className="ml-2 h-5 w-5" />
              </motion.a>
              <motion.a
                href="#contact"
                className="bg-transparent border-2 border-yellow-400 text-yellow-400 px-6 py-3 rounded-md font-medium flex items-center hover:bg-white/10 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Us <ChevronRight className="ml-2 h-5 w-5" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-yellow-400 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-8"
          >
            <motion.div variants={fadeIn}>
              <CounterAnimation target="70" suffix="%" title="Build Test Faster By" />
            </motion.div>
            <motion.div variants={fadeIn}>
              <CounterAnimation target="50" suffix="%" title="Execute Test Faster By" />
            </motion.div>
            <motion.div variants={fadeIn}>
              <CounterAnimation target="80" suffix="%" title="Expand Coverage By" />
            </motion.div>
            <motion.div variants={fadeIn}>
              <CounterAnimation target="50" suffix="%" title="Increase Quality By" />
            </motion.div>
            <motion.div variants={fadeIn}>
              <CounterAnimation target="35" suffix="%" title="Lower Cost By" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <AnimatedSection id="our-story" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeIn}>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Our Story</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-yellow-400 mb-6"></div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                PK International Business School was founded with a vision to transform the way English is taught to
                Malaysian professionals. We recognized that traditional language learning methods often fail to address
                the specific challenges faced by corporate professionals.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our founder, Sr. Anbuchuder, developed the revolutionary Chaarran and PARi Models after years of
                research and practical experience in language education. These models have since helped thousands of
                professionals overcome their fear of speaking English and achieve 100% confidence in their communication
                skills.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Today, PK International stands as a leader in English language education, with a focus on practical,
                confidence-building approaches that deliver real results in professional settings.
              </p>
            </motion.div>
            <motion.div variants={scaleIn} className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 to-yellow-400 rounded-xl blur-lg opacity-30 animate-pulse"></div>
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/events/event1-2.jpeg"
                  alt="PK International classroom"
                  width={500}
                  height={400}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Chairman's Message */}
      <AnimatedSection className="py-20 bg-gradient-to-r from-yellow-50 to-yellow-50 dark:from-yellow-900/20 dark:to-yellow-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Chairmans Message</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-400 mx-auto mb-6"></div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={scaleIn} className="order-2 md:order-1">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl relative">
                <div className="absolute -top-5 -left-5 w-10 h-10 text-5xl text-yellow-400 opacity-30"></div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                  At PK International, we believe that language is not just a tool for communication, but a gateway to
                  personal and professional growth. Our mission is to empower individuals with the confidence and skills
                  to express themselves effectively in English, opening doors to new opportunities and connections.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Through our innovative teaching methodologies and dedicated team of educators, we have helped
                  thousands of professionals overcome their language barriers and achieve their full potential. We are
                  committed to continuing this journey of transformation, one student at a time.
                </p>
                <div className="flex items-center">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">Dr. Paaram Singh</h4>
                    <p className="text-yellow-400 dark:text-yellow-400">Chairman, PK Consortium Group of Companies</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Image
                      src="/placeholder.svg?height=60&width=180"
                      alt="Chairman's signature"
                      width={180}
                      height={60}
                      className="h-12 w-auto"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div variants={scaleIn} className="order-1 md:order-2">
              <div className="relative">
                <div className="absolute  bg-gradient-to-r from-yellow-400 to-yellow-400 rounded-full blur-lg opacity-30 animate-pulse"></div>
                <div className="relative rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl w-64 h-64 mx-auto">
                  <Image
                    src="/chairman.jpeg"
                    alt="Dr. Paaram Singh"
                    width={400}
                    height={400}
                    className="w-full h-full object-fit"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Our Mission Section */}
      <AnimatedSection className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Our Mission & Vision</h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto mb-6"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We are on a mission to transform English language education and empower professionals
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              variants={scaleIn}
              className="bg-white/10 backdrop-blur-lg p-8 rounded-lg shadow-lg border border-white/20 hover:bg-white/20 transition-colors duration-300"
            >
              <div className="feature-icon mx-auto bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <GraduationCap className="h-8 w-8 text-yellow-900" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Our Mission</h3>
              <p className="text-gray-200">
                To empower Malaysian professionals with 100% confidence in English communication through innovative,
                research-backed methodologies that address the unique challenges faced in corporate environments.
              </p>
            </motion.div>

            <motion.div
              variants={scaleIn}
              className="bg-white/10 backdrop-blur-lg p-8 rounded-lg shadow-lg border border-white/20 hover:bg-white/20 transition-colors duration-300"
            >
              <div className="feature-icon mx-auto bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Globe className="h-8 w-8 text-yellow-900" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Our Vision</h3>
              <p className="text-gray-200">
                To be the leading English language education provider in Malaysia, recognized for our transformative
                approach that creates confident, effective communicators who excel in their professional careers.
              </p>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* PK Consortium Group */}
      <AnimatedSection className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">PK Consortium Group of Companies</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-400 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              PK INTERNATIONAL is part of the PK Consortium Group of Companies, spearheaded by Dr. Paaram Singh
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Strength Force Security & Services Sdn Bhd",
                icon: <Building className="h-6 w-6 text-white" />,
                description: "Providing comprehensive security solutions for businesses and organizations.",
              },
              {
                name: "PK Global Security Services Sdn Bhd",
                icon: <Shield className="h-6 w-6 text-white" />,
                description: "Specialized security services for international clients and high-profile events.",
              },
              {
                name: "Global Strength Security Sdn Bhd",
                icon: <Lock className="h-6 w-6 text-white" />,
                description: "Advanced security systems and technology solutions for modern security challenges.",
              },
              {
                name: "Randhawa Force Sdn Bhd",
                icon: <Users className="h-6 w-6 text-white" />,
                description: "Personnel management and security staffing solutions for various industries.",
              },
              {
                name: "Strength Management & Trading Sdn Bhd",
                icon: <Briefcase className="h-6 w-6 text-white" />,
                description: "Business management consulting and international trading services.",
              },
            ].map((company, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="bg-yellow-400 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="bg-black rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  {company.icon}
                </div>
                <h3 className="text-xl font-bold text-black mb-2">{company.name}</h3>
                <p className="text-black">{company.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Our Models Section */}
      <AnimatedSection className="py-20 bg-gradient-to-r from-yellow-50 to-yellow-50 dark:from-yellow-900/20 dark:to-yellow-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Our Innovative Models</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-400 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              The foundation of our teaching methodology
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              variants={scaleIn}
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-yellow-400/20 rounded-bl-full"></div>
              <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-400">
                CHAARRAN MODEL
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The Chaarran Model focuses on Eight Elements of Thought Systems Reinforcement, empowering communication
                with infinite positive phrases.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {["Compassion", "Humble", "Appreciative", "Attentive", "Responsible", "Respect", "Agile", "Noble"].map(
                  (element, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <CheckCircle className="h-5 w-5 text-yellow-400 mr-2" />
                      <span>{element}</span>
                    </motion.div>
                  ),
                )}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-bold mb-3">Three Intentions of Communication:</h4>
                <ul className="space-y-2">
                  <motion.li
                    className="flex items-start"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="bg-gradient-to-r from-yellow-400/20 to-yellow-400/20 rounded-full p-1 mr-3 mt-0.5">
                      <span className="text-yellow-400 dark:text-yellow-400 font-bold text-sm">1</span>
                    </div>
                    <span>To Tell</span>
                  </motion.li>
                  <motion.li
                    className="flex items-start"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="bg-gradient-to-r from-yellow-400/20 to-yellow-400/20 rounded-full p-1 mr-3 mt-0.5">
                      <span className="text-yellow-400 dark:text-yellow-400 font-bold text-sm">2</span>
                    </div>
                    <span>To Question</span>
                  </motion.li>
                  <motion.li
                    className="flex items-start"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="bg-gradient-to-r from-yellow-400/20 to-yellow-400/20 rounded-full p-1 mr-3 mt-0.5">
                      <span className="text-yellow-400 dark:text-yellow-400 font-bold text-sm">3</span>
                    </div>
                    <span>To Respond</span>
                  </motion.li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              variants={scaleIn}
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-yellow-400/20 rounded-bl-full"></div>
              <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-400">
                PARi MODEL
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The PARi Model focuses on building lasting, autopilot habits through Passionate Actions Reinforcement,
                promoting sustainable skill mastery in English communication.
              </p>
              <div className="space-y-6">
                <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                  <h4 className="font-bold flex items-center">
                    <span className="bg-gradient-to-r from-yellow-400/20 to-yellow-400/20 p-1 rounded-full mr-2">
                      <span className="text-yellow-400 dark:text-yellow-400">P</span>
                    </span>
                    Passionate Phrases
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 ml-8">
                    Using passionate communication phrases in everyday roles.
                  </p>
                </motion.div>
                <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                  <h4 className="font-bold flex items-center">
                    <span className="bg-gradient-to-r from-yellow-400/20 to-yellow-400/20 p-1 rounded-full mr-2">
                      <span className="text-yellow-400 dark:text-yellow-400">A</span>
                    </span>
                    Active Listening
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 ml-8">
                    Practicing active, passionate listening to English dialogues.
                  </p>
                </motion.div>
                <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                  <h4 className="font-bold flex items-center">
                    <span className="bg-gradient-to-r from-yellow-400/20 to-yellow-400/20 p-1 rounded-full mr-2">
                      <span className="text-yellow-400 dark:text-yellow-400">Ri</span>
                    </span>
                    Immersive Reading
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 ml-8">
                    Adopting passionate reading techniques for English texts.
                  </p>
                </motion.div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400">
                  The PARi Model cultivates passionate behaviors for achieving 100% Confidence in English speaking,
                  transforming communication into a fearless, energy-positive act.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Training Programs */}
      <AnimatedSection className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Our Training Programs</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-400 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our skill training programs are tailored towards real-life habits and skills for income creation
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "AIR-COND SERVICING & REPAIRING",
                icon: <Snowflake className="h-6 w-6 text-white" />,
                description: "Learn professional air conditioning maintenance and repair techniques.",
              },
              {
                title: "ELECTRICAL & SOLAR INSTALLATION",
                icon: <Zap className="h-6 w-6 text-white" />,
                description: "Master electrical systems and renewable energy installation.",
              },
              {
                title: "AUTOMOTIVE REPAIRING",
                icon: <Car className="h-6 w-6 text-white" />,
                description: "Develop skills in diagnosing and repairing vehicle systems.",
              },
              {
                title: "CUSTOMER SERVICE",
                icon: <HeadphonesIcon className="h-6 w-6 text-white" />,
                description: "Learn effective customer interaction and problem-solving techniques.",
              },
              {
                title: "OFFICE ADMINISTRATION",
                icon: <FileText className="h-6 w-6 text-white" />,
                description: "Master essential administrative skills for modern offices.",
              },
              {
                title: "RETAIL OPERATION",
                icon: <ShoppingBag className="h-6 w-6 text-white" />,
                description: "Develop expertise in retail management and operations.",
              },
            ].map((program, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
              >
                <div className="h-3 bg-gradient-to-r from-yellow-400 to-yellow-400"></div>
                <div className="p-6">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    {program.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-yellow-400 dark:group-hover:text-yellow-400 transition-colors duration-300">
                    {program.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{program.description}</p>
                  <div className="flex items-center text-yellow-400 dark:text-yellow-400 font-medium">
                    <span>Skill Training Certificate</span>
                    <ChevronRight className="ml-1 h-5 w-5 group-hover:ml-2 transition-all duration-300" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Methodologies */}
      <AnimatedSection className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Our Methodologies</h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto mb-6"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">EARN BEFORE GRADUATION & LIFE-TIME COMPETENCIES</p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "'Earn Before Graduation'",
                icon: <Award className="h-6 w-6 text-yellow-900" />,
                description:
                  "Skills Certificate and Diploma programs designed for youth and adults to start earning while still completing their education.",
              },
              {
                title: "I CAN SPEAK ENGLISH",
                icon: <MessageCircle className="h-6 w-6 text-yellow-900" />,
                description:
                  "Coaching program to build 100% confidence in English communication for professional settings.",
              },
              {
                title: "Workforce Thought Systems Reinforcement Training",
                icon: <Brain className="h-6 w-6 text-yellow-900" />,
                description: "Enhancing cognitive processes and decision-making skills in the workplace.",
              },
              {
                title: "Workforce Behavioral Competencies Reinforcement Training",
                icon: <Users className="h-6 w-6 text-yellow-900" />,
                description:
                  "Developing essential behavioral skills for professional success in various work environments.",
              },
              {
                title: "Organizational Behavioral Needs Analysis",
                icon: <BarChart className="h-6 w-6 text-yellow-900" />,
                description:
                  "Comprehensive assessment of organizational behavior and improvement strategies for better workplace dynamics.",
              },
            ].map((method, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-yellow-400 flex items-center justify-center mb-4">
                  {method.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{method.title}</h3>
                <p className="text-gray-300">{method.description}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeIn} className="mt-12 text-center">
            <p className="text-xl font-medium bg-white/10 backdrop-blur-lg py-4 px-6 rounded-lg inline-block">
              EACH SKILL TRAINING ARE TAILORED TOWARDS REAL LIFE TIME HABITS & SKILLS FOR INCOME CREATION.
            </p>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Our Team Section */}
      <AnimatedSection className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Leadership Team</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-400 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Meet the experts behind our innovative programs
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid md:grid-cols-2 gap-72">
            <motion.div variants={scaleIn}>
              <TeamMemberCard
                image="/zuraidah.jpeg"
                name="Prof Dr Zuraidah Mohd Don"
                role="Expert in Applied Linguistics"
                description="With over 25 years of experience in linguistics research, Prof. Zuraidah brings academic rigor to our teaching methodologies."
              />
            </motion.div>

            <motion.div variants={scaleIn}>
              <TeamMemberCard
                image="/anbu.jpeg"
                name="Sr Anbuchuder"
                role="Master Trainer and Program Developer"
                description="The visionary behind our Chaarran and PARi Models, Sr. Anbuchuder has transformed English education through his innovative approaches."
              />
            </motion.div>

              
            </motion.div>

        </div>
      </AnimatedSection>

      {/* Why Choose Us Section */}
      <AnimatedSection className="py-20 bg-yellow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-2">5 Reasons to Choose PK International</h2>
            <div className="w-24 h-1 bg-black mx-auto mb-6"></div>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: 1,
                title: "Escape fear of grammar mistakes",
                description:
                  "Our unique approach helps you overcome the fear of making mistakes while speaking English.",
              },
              {
                number: 2,
                title: "Speak with confidence in meetings",
                description: "Gain the skills to participate confidently in corporate meetings and discussions.",
              },
              {
                number: 3,
                title: "Master self-introduction",
                description: "Learn to introduce yourself professionally and make a lasting first impression.",
              },
              {
                number: 4,
                title: "Enhance your listening skills",
                description:
                  "Improve your ability to understand and respond to English conversations in the workplace.",
              },
              {
                number: 5,
                title: "Accelerate your career growth",
                description: "Unlock new opportunities in your career with improved English communication skills.",
              },
            ].map((reason, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300">
                    {reason.number}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-black group-hover:text-black transition-colors duration-300">
                    {reason.title}
                  </h3>
                  <p className="text-black/80">{reason.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Contact Section */}
      <AnimatedSection id="contact" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div variants={fadeIn}>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Questions?</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-yellow-400 mb-6"></div>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                We would be happy to help you with any questions about our programs.
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-400 flex items-center justify-center mr-4">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Our Location</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      LEVEL 3, NO G-15, JALAN USJ SENTRAL 1, USJ SENTRAL PERSIARAN SUBANG 1, SUBANG JAYA, SELANGOR
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-400 flex items-center justify-center mr-4">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Call Us</h3>
                    <p className="text-gray-600 dark:text-gray-400">+60 03-80116996</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-400 flex items-center justify-center mr-4">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Email Us</h3>
                    <p className="text-gray-600 dark:text-gray-400">ceo@pkibs.com</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex space-x-4">
                <motion.a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-400 flex items-center justify-center text-white"
                  whileHover={{ y: -3, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Facebook className="h-5 w-5" />
                </motion.a>
                <motion.a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-400 flex items-center justify-center text-white"
                  whileHover={{ y: -3, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Twitter className="h-5 w-5" />
                </motion.a>
                <motion.a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-400 flex items-center justify-center text-white"
                  whileHover={{ y: -3, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Instagram className="h-5 w-5" />
                </motion.a>
                <motion.a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-400 flex items-center justify-center text-white"
                  whileHover={{ y: -3, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <LinkedIn className="h-5 w-5" />
                </motion.a>
              </div>
            </motion.div>

            <motion.div variants={scaleIn} className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
              <h3 className="text-2xl font-bold mb-6">Get In Touch</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 dark:bg-gray-700 dark:text-white"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 dark:bg-gray-700 dark:text-white"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 dark:bg-gray-700 dark:text-white"
                    placeholder="How can we help you?"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 dark:bg-gray-700 dark:text-white"
                    placeholder="Your message..."
                  ></textarea>
                </div>
                <motion.button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-400 hover:from-yellow-400 hover:to-yellow-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Send Message
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your English Skills?
          </motion.h2>
          <motion.p variants={fadeIn} className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of successful learners who have achieved 100% confidence in English speaking
          </motion.p>
          <motion.div variants={stagger} className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="/signup/student"
              className="bg-gradient-to-r from-yellow-400 to-yellow-400 hover:from-yellow-400 hover:to-yellow-400 text-yellow-900 font-medium px-8 py-3 rounded-md transition-all duration-200 hover:shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variants={fadeIn}
            >
              Enroll Now
            </motion.a>
            <motion.a
              href="/programs"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-md font-medium hover:bg-white/10 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variants={fadeIn}
            >
              View All Programs
            </motion.a>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <BookOpen className="h-8 w-8 text-yellow-400" />
                <span className="ml-2 text-xl font-bold">PK International</span>
              </div>
              <p className="text-gray-400">
                Empowering professionals through innovative English language education and modern learning experiences.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/" className="hover:text-yellow-400 transition-colors duration-200">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-yellow-400 transition-colors duration-200">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/programs" className="hover:text-yellow-400 transition-colors duration-200">
                    Programs
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="hover:text-yellow-400 transition-colors duration-200">
                    Events
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Programs</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-yellow-400 transition-colors duration-200">
                    iCSE ALPHA
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-400 transition-colors duration-200">
                    iCSE BETA
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-400 transition-colors duration-200">
                    iCSE GAMMA
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-400 transition-colors duration-200">
                    Corporate Training
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 text-yellow-400 mr-2 shrink-0" />
                  <span>
                    LEVEL 3, NO G-15, JALAN USJ SENTRAL 1, USJ SENTRAL PERSIARAN SUBANG 1, SUBANG JAYA, SELANGOR
                  </span>
                </li>
                <li className="flex items-start">
                  <Phone className="h-5 w-5 text-yellow-400 mr-2 shrink-0" />
                  <span>+60 03-80116996</span>
                </li>
                <li className="flex items-start">
                  <Mail className="h-5 w-5 text-yellow-400 mr-2 shrink-0" />
                  <span>ceo@pkibs.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">&copy; 2024 PK International Business School. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                <LinkedIn className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
