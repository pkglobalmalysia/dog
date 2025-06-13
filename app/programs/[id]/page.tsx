"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { motion, useAnimation, useInView } from "framer-motion"
import {
  BookOpen,
  Calendar,
  MapPin,
  Clock,
  Menu,
  X,
  ChevronRight,
  Share2,
  CheckCircle,
  Star,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  LinkedinIcon as LinkedIn,
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

import type { Variants } from "framer-motion"

const scaleIn: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
}

// Section component with animation
type AnimatedSectionProps = {
  children: React.ReactNode
  className?: string
  delay?: number
}

const AnimatedSection = ({ children, className = "", delay = 0 }: AnimatedSectionProps) => {
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




// Sample programs data - simplified for brevity
const programsData = [
  {
    id: "icse-alpha",
    title: "iCSE ALPHA",
    subtitle: "Foundation level | Escape fear of speaking | Build confidence",
    date: "Next intake: July 15, 2023",
    location: "PK International Campus, Subang Jaya",
    image: "/8.jpg",
    description:
      "The iCSE ALPHA program is designed for beginners who want to overcome their fear of speaking English and build foundational confidence. This 8-week program focuses on creating a safe environment where you can practice speaking without judgment, while gradually building your vocabulary and conversation skills.",
    category: "English Speaking",
    price: "RM 1,200",
    duration: "8 weeks",
    schedule: "Weekends (Saturday & Sunday), 9:00 AM - 12:00 PM",
    capacity: 20,
    spotsLeft: 8,
    instructors: [
      {
        name: "Mr. Anbu",
        role: "Lead English Communication Coach",
        image: "/anbu.jpeg",
        bio: "Anbu has over 10 years of experience teaching English to beginners and specializes in helping students overcome speaking anxiety.",
      },
      {
        name: "Ms. Zuraidah",
        role: "Confidence Building Specialist",
        image: "/zuraidah.jpeg",
        bio: "Zuraidah focuses on psychological aspects of language learning and has developed techniques to build speaking confidence quickly.",
      },
    ],
    curriculum: [
      {
        week: "Week 1-2",
        title: "Breaking the Fear Barrier",
        topics: ["Understanding speaking anxiety", "Confidence building exercises", "Basic conversation starters"],
      },
      {
        week: "Week 3-4",
        title: "Building Vocabulary Foundations",
        topics: ["Essential everyday vocabulary", "Simple sentence structures", "Active listening techniques"],
      },
      {
        week: "Week 5-6",
        title: "Conversation Practice",
        topics: ["Role-playing everyday scenarios", "Asking and answering questions", "Group discussion techniques"],
      },
      {
        week: "Week 7-8",
        title: "Confidence Integration",
        topics: ["Extended conversations", "Self-introduction mastery", "Progress assessment and next steps"],
      },
    ],
    highlights: [
      "Small class size (maximum 20 students)",
      "Personalized feedback from experienced coaches",
      "Supportive learning environment",
      "Certificate of completion",
      "3 months of follow-up support",
    ],
    testimonials: [
      {
        name: "Tan Wei Ming",
        company: "Sales Executive",
        text: "Before iCSE ALPHA, I would avoid speaking English at all costs. Now I can confidently handle basic customer inquiries in English. The supportive environment made all the difference.",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        name: "Priya Sharma",
        company: "Administrative Assistant",
        text: "The program helped me overcome my fear of making grammar mistakes. I now speak more freely without constantly worrying about perfect grammar.",
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
  },
  {
    id: "icse-beta",
    title: "iCSE BETA",
    subtitle: "Intermediate level | Master speaking rhythms | Enhance fluency",
    date: "Next intake: August 5, 2023",
    location: "PK International Campus, Subang Jaya",
    image: "/6.jpg",
    description:
      "The iCSE BETA program is designed for intermediate English speakers who want to enhance their fluency and master professional communication. This 10-week program builds on basic English skills and focuses on developing natural speech rhythms, expanding vocabulary, and improving presentation skills for workplace settings.",
    category: "English Speaking",
    price: "RM 1,800",
    duration: "10 weeks",
    schedule: "Weekday evenings (Tuesday & Thursday), 7:00 PM - 9:30 PM",
    capacity: 15,
    spotsLeft: 6,
    instructors: [
      {
        name: "Dr. Anbu",
        role: "Business English Specialist",
        image: "/anbu.jpeg",
        bio: "Dr. Anbu specializes in business English and has helped hundreds of professionals improve their workplace communication skills.",
      },
    ],
    curriculum: [
      {
        week: "Week 1-3",
        title: "Speech Fluency Foundations",
        topics: ["Natural speech rhythms and intonation", "Connected speech techniques", "Fluency-building exercises"],
      },
      {
        week: "Week 4-7",
        title: "Professional Communication",
        topics: ["Business vocabulary", "Meeting participation", "Presentation skills", "Email writing"],
      },
      {
        week: "Week 8-10",
        title: "Professional Integration",
        topics: ["Case studies and role plays", "Extended discussions", "Final presentations and assessment"],
      },
    ],
    highlights: [
      "Focus on professional communication scenarios",
      "Video recording and analysis of presentations",
      "Comprehensive business English materials",
      "Certificate of completion",
    ],
    testimonials: [
      {
        name: "Michael Lim",
        company: "Project Manager, Tech Solutions",
        text: "iCSE BETA transformed my ability to lead team meetings. I now speak more fluently and can express complex ideas clearly. My team has noticed the difference!",
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
  },
  {
    id: "icse-gamma",
    title: "iCSE GAMMA",
    subtitle: "Advanced level | Professional communication | Meeting mastery",
    date: "Next intake: September 10, 2023",
    location: "PK International Campus, Subang Jaya",
    image: "/4.jpg",
    description:
      "The iCSE GAMMA program is our advanced English communication course designed for professionals who need to operate at executive levels. This 12-week intensive program focuses on sophisticated communication techniques, persuasive speaking, negotiation language, and leadership communication that will set you apart in high-stakes business environments.",
    category: "English Speaking",
    price: "RM 2,400",
    duration: "12 weeks",
    schedule: "Weekends (Saturday), 1:00 PM - 5:00 PM",
    capacity: 12,
    spotsLeft: 4,
    instructors: [
      {
        name: "Prof. Dr. Zuraidah Mohd Don",
        role: "Expert in Applied Linguistics",
        image: "/zuraidah.jpeg",
        bio: "With over 25 years of experience in linguistics research, Prof. Zuraidah brings academic rigor to our teaching methodologies.",
      },
    ],
    curriculum: [
      {
        week: "Week 1-4",
        title: "Executive Presence and Communication",
        topics: ["Developing executive presence", "Advanced pronunciation", "Sophisticated vocabulary"],
      },
      {
        week: "Week 5-8",
        title: "Persuasive Communication",
        topics: ["Persuasive language patterns", "Storytelling for business impact", "Data presentation"],
      },
      {
        week: "Week 9-12",
        title: "Leadership Communication",
        topics: ["Negotiation strategies", "Crisis communication", "Executive presentations"],
      },
    ],
    highlights: [
      "One-on-one coaching sessions included",
      "Real-world case studies from your industry",
      "Advanced certificate of completion",
      "6 months of executive communication support",
    ],
    testimonials: [
      {
        name: "Dato' Ahmad Razali",
        company: "CEO, Malaysian Banking Group",
        text: "iCSE GAMMA elevated my communication to match my executive role. I now lead board meetings with confidence and clarity that commands respect.",
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
  },
]

// Get related programs - programs in the same category
interface ProgramInstructor {
    name: string
    role: string
    image: string
    bio: string
}

interface ProgramCurriculumSection {
    week: string
    title: string
    topics: string[]
}

interface ProgramTestimonial {
    name: string
    company: string
    text: string
    image: string
}

interface Program {
    id: string
    title: string
    subtitle: string
    date: string
    location: string
    image: string
    description: string
    category: string
    price: string
    duration: string
    schedule: string
    capacity: number
    spotsLeft: number
    instructors: ProgramInstructor[]
    curriculum: ProgramCurriculumSection[]
    highlights: string[]
    testimonials: ProgramTestimonial[]
}

const getRelatedPrograms = (
    currentProgram: Program | null,
    allPrograms: Program[]
): Program[] => {
    if (!currentProgram) return []
    return allPrograms
        .filter((program) => program.category === currentProgram.category && program.id !== currentProgram.id)
        .slice(0, 2)
}

export default function ProgramDetailsPage() {
  const params = useParams()
  const programId = params.id
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [program, setProgram] = useState<Program | null>(null)
  const [relatedPrograms, setRelatedPrograms] = useState<Program[]>([])

  // In a real app, you would fetch the program data based on the ID
  useEffect(() => {
    // Simulate API call
    const foundProgram = programsData.find((p) => p.id === programId)
    setProgram(foundProgram || programsData[0]) // Fallback to first program if not found

    // Get related programs
    if (foundProgram) {
      setRelatedPrograms(getRelatedPrograms(foundProgram, programsData))
    }

    // Scroll to top on page load
    window.scrollTo(0, 0)
  }, [programId])

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    )
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
                  className="text-gray-300 hover:text-yellow-400 font-medium transition-colors duration-200"
                >
                  About
                </Link>
                <Link
                  href="/programs"
                  className="text-white hover:text-yellow-400 font-medium border-b-2 border-yellow-400 pb-1 transition-colors duration-200"
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
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-yellow-900 font-medium px-4 py-2 rounded-md transition-all duration-200 hover:shadow-lg"
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
            className="md:hidden bg-gradient-to-r from-yellow-900 to-yellow-900 border-t border-yellow-800 py-4"
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
                className="block text-gray-300 hover:text-yellow-400 font-medium transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/programs"
                className="block text-white hover:text-yellow-400 font-medium transition-colors duration-200"
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
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-yellow-900 font-medium px-4 py-2 rounded-md transition-all duration-200 hover:shadow-lg inline-block text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Breadcrumb */}
      <div className="bg-gray-100 dark:bg-gray-900 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Link href="/" className="hover:text-yellow-400 dark:hover:text-yellow-400">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href="/programs" className="hover:text-yellow-400 dark:hover:text-yellow-400">
              Programs
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-gray-900 dark:text-white font-medium">{program.title}</span>
          </div>
        </div>
      </div>

      {/* Program Hero */}
      <section className="relative bg-cover bg-center">
        <div className="h-[50vh] md:h-[60vh] relative overflow-hidden">
          <Image src={program.image || "/placeholder.svg"} alt={program.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <div className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-400 text-white text-sm font-bold px-3 py-1 rounded-md mb-4">
                  {program.category}
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 max-w-4xl">{program.title}</h1>
                <p className="text-xl text-gray-200 mb-4 max-w-3xl">{program.subtitle}</p>
                <div className="flex flex-wrap gap-6 text-white">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-yellow-400 mr-2" />
                    <span>{program.date}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-yellow-400 mr-2" />
                    <span>{program.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-yellow-400 mr-2" />
                    <span>{program.location}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info Bar */}
      <section className="bg-black text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex flex-wrap gap-8 mb-4 md:mb-0">
              <div>
                <div className="text-sm text-gray-300">Price</div>
                <div className="font-bold">{program.price}</div>
              </div>
              <div>
                <div className="text-sm text-gray-300">Schedule</div>
                <div className="font-bold">{program.schedule}</div>
              </div>
              <div>
                <div className="text-sm text-gray-300">Spots Left</div>
                <div className="font-bold">
                  {program.spotsLeft} of {program.capacity}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-200"
              >
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left Column - Main Content */}
            <div className="lg:w-3/3">
              {/* Tabs Navigation */}
              <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap -mb-px">
                  {["overview", "curriculum", "instructors"].map((tab) => (
                    <button
                      key={tab}
                      className={`inline-block py-4 px-4 font-medium text-lg border-b-2 ${
                        activeTab === tab
                          ? "border-yellow-400 text-yellow-400 dark:border-yellow-400 dark:text-yellow-400"
                          : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="tab-content">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <AnimatedSection>
                    <motion.div variants={fadeIn}>
                      <h2 className="text-2xl font-bold mb-6">About This Program</h2>
                      <p className="text-gray-700 dark:text-gray-300 mb-8 text-lg leading-relaxed">
                        {program.description}
                      </p>

                      {program.highlights && (
                        <div className="mb-12">
                          <h3 className="text-xl font-bold mb-4">Program Highlights</h3>
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6">
                            <ul className="space-y-3">
                              {program.highlights.map((highlight, index) => (
                                <motion.li
                                  key={index}
                                  className="flex items-start"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 * index }}
                                >
                                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full p-1 mr-3 mt-1 flex-shrink-0">
                                    <svg
                                      className="h-3 w-3 text-white"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  </div>
                                  <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {program.testimonials && (
                        <div>
                          <h3 className="text-xl font-bold mb-6">What Our Students Say</h3>
                          <div className="grid md:grid-cols-2 gap-6">
                            {program.testimonials.map((testimonial, index) => (
                              <motion.div
                                key={index}
                                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
                                whileHover={{ y: -5 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                              >
                                <div className="flex mb-4">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className="h-4 w-4 text-yellow-400" fill="currentColor" />
                                  ))}
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 italic mb-4">{testimonial.text}</p>
                                <div className="flex items-center">
                                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                                    <Image
                                      src={testimonial.image || "/placeholder.svg"}
                                      alt={testimonial.name}
                                      width={48}
                                      height={48}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <h4 className="font-bold">{testimonial.name}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.company}</p>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatedSection>
                )}

                {/* Curriculum Tab */}
                {activeTab === "curriculum" && (
                  <AnimatedSection>
                    <motion.div variants={fadeIn}>
                      <h2 className="text-2xl font-bold mb-6">Program Curriculum</h2>
                      <div className="space-y-8">
                        {program.curriculum.map((section, sectionIndex) => (
                          <div key={sectionIndex} className="border-l-4 border-yellow-500 pl-6">
                            <h3 className="text-xl font-bold mb-2">{section.week}</h3>
                            <p className="text-yellow-400 dark:text-yellow-400 font-medium mb-4">{section.title}</p>
                            <div className="space-y-4">
                              {section.topics.map((topic, topicIndex) => (
                                <motion.div
                                  key={topicIndex}
                                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 * topicIndex }}
                                >
                                  <div className="flex items-start">
                                    <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-full p-1 mr-3 flex-shrink-0">
                                      <CheckCircle className="h-4 w-4 text-yellow-400 dark:text-yellow-400" />
                                    </div>
                                    <span className="text-gray-700 dark:text-gray-300">{topic}</span>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatedSection>
                )}

                {/* Instructors Tab */}
                {activeTab === "instructors" && (
                  <AnimatedSection>
                    <motion.div variants={fadeIn}>
                      <h2 className="text-2xl font-bold mb-6">Program Instructors</h2>
                      <div className="grid md:grid-cols-2 gap-8">
                        {program.instructors.map((instructor, index) => (
                          <motion.div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden group"
                            whileHover={{ y: -5 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            <div className="md:flex">
                              <div className="md:w-1/3">
                                <div className="h-48 md:h-full relative">
                                  <Image
                                    src={instructor.image || "/placeholder.svg"}
                                    alt={instructor.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                </div>
                              </div>
                              <div className="p-6 md:w-2/3">
                                <h3 className="text-xl font-bold mb-1">{instructor.name}</h3>
                                <p className="text-yellow-400 dark:text-yellow-400 mb-4">{instructor.role}</p>
                                <p className="text-gray-600 dark:text-gray-300">{instructor.bio}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatedSection>
                )}
              </div>
            </div>

        
          </div>
        </div>
      </section>

      {/* Related Programs */}
      {relatedPrograms.length > 0 && (
        <AnimatedSection className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeIn} className="mb-12">
              <h2 className="text-3xl font-bold mb-2">Related Programs</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-yellow-500 to-yellow-400 mb-6"></div>
              <p className="text-gray-600 dark:text-gray-400">You might also be interested in these programs</p>
            </motion.div>

            <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {relatedPrograms.map((relatedProgram) => (
                <motion.div
                  key={relatedProgram.id}
                  variants={scaleIn}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={relatedProgram.image || "/placeholder.svg"}
                      alt={relatedProgram.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      {relatedProgram.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-2 group-hover:text-yellow-400 dark:group-hover:text-yellow-400 transition-colors duration-300">
                      {relatedProgram.title}
                    </h3>
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 text-yellow-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{relatedProgram.date}</span>
                    </div>
                    <div className="flex items-center mb-4">
                      <MapPin className="h-4 w-4 text-yellow-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{relatedProgram.location}</span>
                    </div>
                    <Link
                      href={`/programs/${relatedProgram.id}`}
                      className="text-yellow-400 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 font-medium flex items-center group/link"
                    >
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1 group-hover/link:ml-2 transition-all duration-300" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>
      )}

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
                  <Link href="/programs/icse-alpha" className="hover:text-yellow-400 transition-colors duration-200">
                    iCSE ALPHA
                  </Link>
                </li>
                <li>
                  <Link href="/programs/icse-beta" className="hover:text-yellow-400 transition-colors duration-200">
                    iCSE BETA
                  </Link>
                </li>
                <li>
                  <Link href="/programs/icse-gamma" className="hover:text-yellow-400 transition-colors duration-200">
                    iCSE GAMMA
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 text-yellow-400 mr-2 shrink-0" />
                  <span>LEVEL 3, NO G-15, JALAN USJ SENTRAL 1, SUBANG JAYA, SELANGOR</span>
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
