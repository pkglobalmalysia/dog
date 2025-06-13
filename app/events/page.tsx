"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useAnimation, useInView } from "framer-motion"
import {
  BookOpen,
  Calendar,
  MapPin,
  ChevronRight,
  Menu,
  X,
  Facebook,
  Twitter,
  Instagram,
  LinkedinIcon as LinkedIn,
  Phone,
  Mail,
} from "lucide-react"
import FeaturedEventsCarousel, { type Event } from "@/components/featured-events-carousel"

import type { Variants } from "framer-motion"

// Animation variants
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const scaleIn: Variants = {
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
type AnimatedSectionProps = {
  children: React.ReactNode
  className?: string
  delay?: number
  id?: string
}

const AnimatedSection = ({ children, className = "", delay = 0, id }: AnimatedSectionProps) => {
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
      id={id}
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

// Event Card Component
type EventCardProps = {
  event: Event
  featured?: boolean
}

const EventCard = ({ event, featured = false }: EventCardProps) => {
  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 h-full flex flex-col ${
        featured ? "border-t-4 border-yellow-400" : ""
      }`}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <div className="relative overflow-hidden">
        <div className="aspect-video relative">
          <Image
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
        </div>
        <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
          {event.category || "Event"}
        </div>
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-xl font-bold mb-3 group-hover:text-yellow-400 dark:group-hover:text-yellow-400 transition-colors duration-300">
          {event.title}
        </h3>
        <div className="flex items-center mb-2">
          <Calendar className="h-4 w-4 text-yellow-400 mr-2 flex-shrink-0" />
          <span className="text-sm text-gray-600 dark:text-gray-400">{event.date}</span>
        </div>
        <div className="flex items-center mb-4">
          <MapPin className="h-4 w-4 text-yellow-400 mr-2 flex-shrink-0" />
          <span className="text-sm text-gray-600 dark:text-gray-400">{event.location}</span>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">{event.description}</p>
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
          <Link
            href={`/events/${event.id}`}
            className="text-yellow-400 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 font-medium flex items-center group/link"
          >
            Learn More
            <ChevronRight className="h-4 w-4 ml-1 group-hover/link:ml-2 transition-all duration-300" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default function EventsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Sample events data
  const events = [
    {
      id: "1",
      title: "English Communication Mastery Workshop",
      date: "June 15-17, 2023",
      location: "Kuala Lumpur, Malaysia",
      image: "/events/event2-1.jpeg",
      description:
        "Master professional English communication skills with our intensive three-day workshop led by industry experts.",
      category: "Workshop",
    },
    {
      id: "2",
      title: "Corporate English Training Showcase",
      date: "July 8, 2023",
      location: "Penang, Malaysia",
      image: "/events/event3-4.jpeg",
      description:
        "Discover how our corporate English training programs can transform your team's communication effectiveness.",
      category: "Showcase",
    },
    {
      id: "3",
      title: "Virtual English Speaking Practice Session",
      date: "August 12, 2023",
      location: "Virtual Event",
      image: "/events/event2-2.jpeg",
      description:
        "Join our online practice session to improve your English speaking skills in a supportive environment.",
      category: "Virtual",
    },
    {
      id: "4",
      title: "Business English Certification Course",
      date: "September 5-7, 2023",
      location: "Johor Bahru, Malaysia",
      image: "/events/event1-4.jpeg",
      description:
        "Earn a recognized certification in Business English to advance your career and professional opportunities.",
      category: "Course",
    },
    {
      id: "5",
      title: "English for Technology Professionals",
      date: "October 20-22, 2023",
      location: "Cyberjaya, Malaysia",
      image: "/events/event3-6.jpeg",
      description:
        "Specialized English training for IT and technology professionals focusing on industry-specific terminology.",
      category: "Specialized",
    },
    {
      id: "6",
      title: "International Business Communication Summit",
      date: "November 15, 2023",
      location: "Kuala Lumpur, Malaysia",
      image: "/events/event2-4.jpeg",
      description: "Connect with global business leaders and learn effective cross-cultural communication strategies.",
      category: "Summit",
    },
  ]

  // Featured events
  const featuredEvents = [
    {
      id: "featured1",
      title: "Seminar and International Luncheon",
      date: "February 10, 2025",
      location: "Grand Dorsett Subang Jaya",
      image: "/events/event1-1.jpeg",
      description:
        "Our flagship 4-day intensive bootcamp designed to transform your English speaking confidence. Using our revolutionary Chaarran and PARi Models, you'll overcome speaking anxiety and develop lasting communication habits.",
      category: "Featured",
      highlights: [
        "Personalized coaching from certified trainers",
        "Real-world business communication scenarios",
        "Networking with professionals from various industries",
        "Certificate of completion recognized by major corporations",
      ],
    },
    {
      id: "featured2",
      title: "ICSE Seminar at SMK Petaling",
      date: "March 20, 2025",
      location: "SMK Petaling",
      image: "/events/event2-2.jpeg",
      description:
        "An exclusive program designed for senior executives and leaders who need to communicate confidently in high-stakes international business settings. Master advanced communication techniques and leadership presence.",
      category: "Featured",
      highlights: [
        "One-on-one coaching with industry experts",
        "Advanced negotiation and presentation techniques",
        "Cross-cultural communication strategies",
        "Executive networking opportunities",
      ],
    },
    {
      id: "featured3",
      title: "MoU Signing Ceremony: NUBE & PKIBS",
      date: "April 12, 2025",
      location: "SVenue TBA",
      image: "/events/event3-5.jpeg",
      description:
        "A one-day symposium focused on how English proficiency can accelerate your career growth. Learn from industry leaders and successful professionals about the impact of effective communication on career advancement.",
      category: "Featured",
      highlights: [
        "Panel discussions with industry leaders",
        "Career advancement workshops",
        "Resume and interview skills in English",
        "Networking lunch with recruiters and HR professionals",
      ],
    },
  ]

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
                  className="text-gray-300 hover:text-yellow-400 font-medium transition-colors duration-200"
                >
                  Programs
                </Link>
                <Link
                  href="/events"
                  className="text-white hover:text-yellow-400 font-medium border-b-2 border-yellow-400 pb-1 transition-colors duration-200"
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
                className="bg-gradient-to-r from-yellow-400 to-yellow-400 hover:from-yellow-400 hover:to-yellow-400 text-black font-medium px-4 py-2 rounded-md transition-all duration-200 hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:text-yellow-400 transition-colors duration-200"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
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
                className="block text-gray-300 hover:text-yellow-400 font-medium transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/events"
                className="block text-white hover:text-yellow-400 font-medium transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Events
              </Link>
              <Link
                href="/programs"
                className="block text-gray-300 hover:text-yellow-400 font-medium transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Programs
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
                  className="bg-gradient-to-r from-yellow-400 to-yellow-400 hover:from-yellow-400 hover:to-yellow-400 text-black font-medium px-4 py-2 rounded-md transition-all duration-200 hover:shadow-lg inline-block text-center"
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
      <section className="relative bg-cover bg-center h-[60vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          
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
              Upcoming{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-400">
                Events
              </span>
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-yellow-400 my-6"></div>
            <p className="text-xl text-gray-200 max-w-2xl">
              Discover educational events, workshops, and conferences designed to enhance your English communication
              skills and professional development.
            </p>
            {/* Hero Section Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <motion.a
                href="#featured-events"
                className="bg-yellow-400 text-black px-6 py-3 rounded-md font-medium flex items-center hover:bg-gray-100 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById("featured-events")?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                Featured Events <ChevronRight className="ml-2 h-5 w-5" />
              </motion.a>
              <motion.a
                href="#all-events"
                className="bg-transparent border-2 border-yellow-400 text-yellow-400 px-6 py-3 rounded-md font-medium flex items-center hover:bg-white/10 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById("all-events")?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                Browse All Events <ChevronRight className="ml-2 h-5 w-5" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Events */}
      <AnimatedSection
        id="featured-events"
        className="py-20 bg-gradient-to-r from-yellow-50 to-yellow-50 dark:from-yellow-400/20 dark:to-yellow-400/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Events</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-400 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Do not miss our flagship events of the season
            </p>
          </motion.div>

          <FeaturedEventsCarousel events={featuredEvents} />
        </div>
      </AnimatedSection>

      {/* Events Grid */}
      <AnimatedSection id="all-events" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeIn} className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">All Events</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-yellow-400 mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-400">Browse our upcoming events and register today</p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <motion.div key={event.id} variants={scaleIn}>
                <EventCard event={event} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Newsletter Section */}
      <AnimatedSection className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-50 dark:from-yellow-400/20 dark:to-yellow-400/20 rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <motion.div variants={fadeIn}>
                <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Subscribe to our newsletter to receive updates on upcoming events, workshops, and special offers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="flex-grow px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 dark:bg-gray-700 dark:text-white"
                  />
                  <motion.button
                    className="bg-gradient-to-r from-yellow-400 to-yellow-400 hover:from-yellow-400 hover:to-yellow-700 text-white font-medium px-6 py-3 rounded-md transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Subscribe
                  </motion.button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </motion.div>
              <motion.div variants={scaleIn} className="hidden md:block">
                <div className="relative h-64">
                  <Image
                    src="/events/event2-3.jpeg"
                    alt="Newsletter"
                    fill
                    className="object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-yellow-400/30 rounded-lg"></div>
                </div>
              </motion.div>
            </div>
          </div>
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
                  <Link href="/events" className="hover:text-yellow-400 transition-colors duration-200">
                    Events
                  </Link>
                </li>
                <li>
                  <Link href="/programs" className="hover:text-yellow-400 transition-colors duration-200">
                    Programs
                  </Link>
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
            <div>
              <h3 className="font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                  <LinkedIn className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center md:text-left">
            <p className="text-gray-400">&copy; 2024 PK International Business School. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
