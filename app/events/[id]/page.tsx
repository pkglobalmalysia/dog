"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { motion, useAnimation, useInView } from "framer-motion";
import {
  BookOpen,
  Calendar,
  MapPin,
  Clock,
  Menu,
  X,
  ChevronRight,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  LinkedinIcon as LinkedIn,
} from "lucide-react";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

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
};

// Section component with animation
import { ReactNode } from "react";

type AnimatedSectionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

const AnimatedSection = ({
  children,
  className = "",
  delay = 0,
}: AnimatedSectionProps) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

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
  );
};

// Sample events data - in a real app, this would come from an API or database
const eventsData = [
  {
    id: "1",
    title: "English Communication Mastery Workshop",
    date: "June 15-17, 2023",
    time: "9:00 AM - 5:00 PM",
    location: "Kuala Lumpur Convention Centre, Malaysia",
    image: "/placeholder.svg?height=600&width=1200",
    description:
      "Master professional English communication skills with our intensive three-day workshop led by industry experts. This comprehensive program is designed for professionals who want to enhance their English speaking confidence in business settings.",
    category: "Workshop",

    speakers: [
      {
        name: "Dr. Sarah Chen",
        role: "Lead Communication Coach",
        image: "/placeholder.svg?height=200&width=200",
        bio: "Dr. Chen has over 15 years of experience in teaching business English and communication skills to corporate professionals.",
      },
      {
        name: "Prof. James Wilson",
        role: "English Language Specialist",
        image: "/placeholder.svg?height=200&width=200",
        bio: "Professor Wilson specializes in applied linguistics and has developed innovative methods for teaching English to non-native speakers.",
      },
    ],

    highlights: [
      "Personalized feedback from expert coaches",
      "Comprehensive workbook and digital resources",
      "Certificate of completion",
      "6 months of follow-up support",
      "Networking opportunities with professionals from various industries",
    ],
    testimonials: [
      {
        name: "Michael Tan",
        company: "Global Solutions Inc.",
        text: "This workshop transformed my ability to communicate with international clients. I now feel confident leading meetings in English.",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        name: "Priya Sharma",
        company: "Tech Innovations Sdn Bhd",
        text: "The practical approach and supportive environment helped me overcome my fear of speaking English in professional settings.",
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
  },
  {
    id: "2",
    title: "Corporate English Training Showcase",
    date: "July 8, 2023",
    time: "10:00 AM - 4:00 PM",
    location: "Penang Marriott Resort, Malaysia",
    image: "/placeholder.svg?height=600&width=1200",
    description:
      "Discover how our corporate English training programs can transform your team's communication effectiveness. This showcase event is designed for HR managers, L&D professionals, and business leaders who want to explore comprehensive English language solutions for their organizations.",
    category: "Showcase",
    speakers: [
      {
        name: "Sr. Anbuchuder",
        role: "Master Trainer and Program Developer",
        image: "/placeholder.svg?height=200&width=200",
        bio: "The visionary behind our Chaarran and PARi Models, Sr. Anbuchuder has transformed English education through his innovative approaches.",
      },
      {
        name: "Dato' Ahmad Razali",
        role: "Corporate Training Consultant",
        image: "/placeholder.svg?height=200&width=200",
        bio: "With over 20 years of experience in corporate training, Dato' Ahmad specializes in developing customized language programs for multinational companies.",
      },
    ],

    highlights: [
      "Live demonstrations of training methodologies",
      "Complimentary training needs assessment",
      "Exclusive event-only discounts on corporate packages",
      "Networking lunch with industry peers",
      "Take-home resources for HR professionals",
    ],
    testimonials: [
      {
        name: "Tan Sri Wong",
        company: "Malaysian Banking Group",
        text: "Implementing PK International's training across our customer service teams resulted in measurable improvements in client satisfaction scores.",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        name: "Sarah Abdullah",
        company: "Petronas",
        text: "The customized approach to our industry-specific needs made this program exceptionally valuable for our international teams.",
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
  },
  {
    id: "featured",
    title: "PK International English Confidence Bootcamp",
    date: "July 25-28, 2023",
    time: "8:30 AM - 6:00 PM",
    location: "Kuala Lumpur Convention Centre, Malaysia",
    image: "/placeholder.svg?height=600&width=1200",
    description:
      "Our flagship 4-day intensive bootcamp designed to transform your English speaking confidence. Using our revolutionary Chaarran and PARi Models, you'll overcome speaking anxiety and develop lasting communication habits that will enhance your professional presence. This immersive experience combines theory, practice, and personalized coaching to deliver remarkable results in just four days.",
    category: "Featured",
    speakers: [
      {
        name: "Prof Dr Zuraidah Mohd Don",
        role: "Expert in Applied Linguistics",
        image: "/placeholder.svg?height=200&width=200",
        bio: "With over 25 years of experience in linguistics research, Prof. Zuraidah brings academic rigor to our teaching methodologies.",
      },
      {
        name: "Dr. Gerry Knowles",
        role: "Specialist in English Phonetics",
        image: "/placeholder.svg?height=200&width=200",
        bio: "Dr. Knowles specializes in English pronunciation and has developed our unique approach to mastering English speech patterns.",
      },
      {
        name: "Sr. Anbuchuder",
        role: "Master Trainer and Program Developer",
        image: "/placeholder.svg?height=200&width=200",
        bio: "The visionary behind our Chaarran and PARi Models, Sr. Anbuchuder has transformed English education through his innovative approaches.",
      },
    ],

    highlights: [
      "Personalized coaching from certified trainers",
      "Real-world business communication scenarios",
      "Networking with professionals from various industries",
      "Certificate of completion recognized by major corporations",
      "Comprehensive workbook and digital resources",
      "6 months of follow-up support and practice sessions",
      "Money-back guarantee if you don't see improvement",
    ],
    testimonials: [
      {
        name: "Lim Wei Ling",
        company: "Maybank",
        text: "The bootcamp was transformative. In just four days, I gained the confidence to lead meetings in English that I would have avoided before.",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        name: "Rajesh Kumar",
        company: "Dell Technologies",
        text: "The practical approach and supportive environment helped me overcome my fear of speaking English in professional settings. Highly recommended!",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        name: "Nurul Huda",
        company: "AirAsia",
        text: "I've attended many English courses before, but none delivered results like this bootcamp. The Chaarran Model really works!",
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
  },
  {
    id: "3",
    title: "Virtual English Speaking Practice Session",
    date: "August 12, 2023",
    time: "7:00 PM - 9:00 PM",
    location: "Virtual Event (Zoom)",
    image: "/placeholder.svg?height=600&width=1200",
    description:
      "Join our online practice session to improve your English speaking skills in a supportive environment. This interactive virtual event is perfect for busy professionals who want to practice their English speaking skills from the comfort of their home or office.",
    category: "Virtual",
    speakers: [
      {
        name: "Lisa Wong",
        role: "Online English Coach",
        image: "/placeholder.svg?height=200&width=200",
        bio: "Lisa specializes in creating comfortable virtual environments where participants can practice English without fear of judgment.",
      },
    ],

    highlights: [
      "Small group size for maximum speaking time",
      "Personalized feedback from experienced coaches",
      "Practice materials provided before the session",
      "Recording available for self-review (optional)",
      "Certificate of participation",
    ],
    testimonials: [
      {
        name: "Ahmad Zulkifli",
        company: "IBM Malaysia",
        text: "The virtual format works surprisingly well. I got plenty of speaking practice and valuable feedback in just two hours.",
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
  },
];

type EventType = (typeof eventsData)[number];

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params.id;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [event, setEvent] = useState<EventType | null>(null);

  // In a real app, you would fetch the event data based on the ID
  useEffect(() => {
    // Simulate API call
    const foundEvent = eventsData.find((e) => e.id === eventId);
    setEvent(foundEvent || eventsData[0]); // Fallback to first event if not found

    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, [eventId]);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
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
                  href="/events"
                  className="text-white hover:text-yellow-400 font-medium border-b-2 border-yellow-400 pb-1 transition-colors duration-200"
                >
                  Events
                </Link>
                <Link
                  href="/courses"
                  className="text-gray-300 hover:text-yellow-400 font-medium transition-colors duration-200"
                >
                  Courses
                </Link>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/login"
                className="text-white hover:text-yellow-400 transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/signup/student"
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-medium px-4 py-2 rounded-md transition-all duration-200 hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:text-yellow-400 transition-colors duration-200"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
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
            className="md:hidden bg-gradient-to-r from-black to-black border-t border-yellow-800 py-4"
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
                href="/courses"
                className="block text-gray-300 hover:text-yellow-400 font-medium transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Courses
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
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-medium px-4 py-2 rounded-md transition-all duration-200 hover:shadow-lg inline-block text-center"
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
            <Link
              href="/"
              className="hover:text-yellow-400 dark:hover:text-yellow-400"
            >
              Home
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link
              href="/events"
              className="hover:text-yellow-400 dark:hover:text-yellow-400"
            >
              Events
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-gray-900 dark:text-white font-medium">
              {event.title}
            </span>
          </div>
        </div>
      </div>

      {/* Event Hero */}
      <section className="relative bg-cover bg-center">
        <div className="h-[50vh] md:h-[60vh] relative overflow-hidden">
          <Image
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-400 text-white text-sm font-bold px-3 py-1 rounded-md mb-4">
                  {event.category}
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 max-w-4xl">
                  {event.title}
                </h1>
                <div className="flex flex-wrap gap-6 text-white">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-yellow-400 mr-2" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-yellow-400 mr-2" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-yellow-400 mr-2" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </motion.div>
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
                  {["overview", "speakers", "location"].map((tab) => (
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
                      <h2 className="text-2xl font-bold mb-6">
                        About This Event
                      </h2>
                      <p className="text-gray-700 dark:text-gray-300 mb-8 text-lg leading-relaxed">
                        {event.description}
                      </p>

                      {event.highlights && (
                        <div className="mb-12">
                          <h3 className="text-xl font-bold mb-4">
                            Event Highlights
                          </h3>
                          <div className="bg-yellow-50 dark:bg-black/20 rounded-xl p-6">
                            <ul className="space-y-3">
                              {event.highlights.map((highlight, index) => (
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
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {highlight}
                                  </span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {event.testimonials && (
                        <div>
                          <h3 className="text-xl font-bold mb-6">
                            What Participants Say
                          </h3>
                          <div className="grid md:grid-cols-2 gap-6">
                            {event.testimonials.map((testimonial, index) => (
                              <motion.div
                                key={index}
                                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
                                whileHover={{ y: -5 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 10,
                                }}
                              >
                                <div className="flex items-center mb-4">
                                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                                    <Image
                                      src={
                                        testimonial.image || "/placeholder.svg"
                                      }
                                      alt={testimonial.name}
                                      width={48}
                                      height={48}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <h4 className="font-bold">
                                      {testimonial.name}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {testimonial.company}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 italic">
                                  {testimonial.text}
                                </p>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatedSection>
                )}

                {/* Speakers Tab */}
                {activeTab === "speakers" && (
                  <AnimatedSection>
                    <motion.div variants={fadeIn}>
                      <h2 className="text-2xl font-bold mb-6">
                        Event Speakers
                      </h2>
                      <div className="grid md:grid-cols-2 gap-8">
                        {event.speakers.map((speaker, index) => (
                          <motion.div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden group"
                            whileHover={{ y: -5 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 10,
                            }}
                          >
                            <div className="md:flex">
                              <div className="md:w-1/3">
                                <div className="h-48 md:h-full relative">
                                  <Image
                                    src={speaker.image || "/placeholder.svg"}
                                    alt={speaker.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                </div>
                              </div>
                              <div className="p-6 md:w-2/3">
                                <h3 className="text-xl font-bold mb-1">
                                  {speaker.name}
                                </h3>
                                <p className="text-yellow-400 dark:text-yellow-400 mb-4">
                                  {speaker.role}
                                </p>
                                <p className="text-gray-600 dark:text-gray-300">
                                  {speaker.bio}
                                </p>
                                <div className="mt-4 flex space-x-3">
                                  <a
                                    href="#"
                                    className="text-gray-400 hover:text-yellow-400 dark:hover:text-yellow-400 transition-colors"
                                  >
                                    <LinkedIn className="h-5 w-5" />
                                  </a>
                                  <a
                                    href="#"
                                    className="text-gray-400 hover:text-yellow-400 dark:hover:text-yellow-400 transition-colors"
                                  >
                                    <Twitter className="h-5 w-5" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatedSection>
                )}

                {/* Location Tab */}
                {activeTab === "location" && (
                  <AnimatedSection>
                    <motion.div variants={fadeIn}>
                      <h2 className="text-2xl font-bold mb-6">
                        Event Location
                      </h2>
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
                        <div className="h-64 relative">
                          <Image
                            src="/placeholder.svg?height=400&width=800"
                            alt="Event location map"
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-yellow-400 text-white p-4 rounded-full animate-bounce">
                              <MapPin className="h-8 w-8" />
                            </div>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold mb-2">
                            {event.location}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {event.category === "Virtual"
                              ? "This is a virtual event. Connection details will be sent after registration."
                              : "Detailed directions and parking information will be sent after registration."}
                          </p>
                          {event.category !== "Virtual" && (
                            <motion.a
                              href="#"
                              className="text-yellow-400 dark:text-yellow-400 font-medium flex items-center"
                              whileHover={{ x: 5 }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 10,
                              }}
                            >
                              Get Directions
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </motion.a>
                          )}
                        </div>
                      </div>

                      {event.category !== "Virtual" && (
                        <div>
                          <h3 className="text-xl font-bold mb-4">
                            Nearby Accommodations
                          </h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            {[
                              {
                                name: "Grand Millennium Hotel",
                                distance: "0.3 km away",
                                image: "/placeholder.svg?height=100&width=200",
                              },
                              {
                                name: "Traders Hotel",
                                distance: "0.5 km away",
                                image: "/placeholder.svg?height=100&width=200",
                              },
                            ].map((hotel, index) => (
                              <motion.div
                                key={index}
                                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex items-center"
                                whileHover={{ y: -3 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 10,
                                }}
                              >
                                <div className="w-20 h-20 relative flex-shrink-0 mr-4 rounded-md overflow-hidden">
                                  <Image
                                    src={hotel.image || "/placeholder.svg"}
                                    alt={hotel.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div>
                                  <h4 className="font-medium">{hotel.name}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {hotel.distance}
                                  </p>
                                  <a
                                    href="#"
                                    className="text-sm text-yellow-400 dark:text-yellow-400 hover:underline"
                                  >
                                    View Details
                                  </a>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatedSection>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Events */}
      <AnimatedSection className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeIn} className="mb-12">
            <h2 className="text-3xl font-bold mb-2">Related Events</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-yellow-500 to-yellow-400 mb-6"></div>
            <p className="text-gray-600 dark:text-gray-400">
              You might also be interested in these events
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {eventsData
              .filter((e) => e.id !== event.id)
              .slice(0, 3)
              .map((relatedEvent) => (
                <motion.div
                  key={relatedEvent.id}
                  variants={scaleIn}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={relatedEvent.image || "/placeholder.svg"}
                      alt={relatedEvent.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      {relatedEvent.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-2 group-hover:text-yellow-400 dark:group-hover:text-yellow-400 transition-colors duration-300">
                      {relatedEvent.title}
                    </h3>
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 text-yellow-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {relatedEvent.date}
                      </span>
                    </div>
                    <div className="flex items-center mb-4">
                      <MapPin className="h-4 w-4 text-yellow-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {relatedEvent.location}
                      </span>
                    </div>
                    <Link
                      href={`/events/${relatedEvent.id}`}
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

      {/* CTA Section */}
      <AnimatedSection className="py-20 bg-gradient-to-r from-black to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            variants={fadeIn}
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            Ready to Transform Your English Skills?
          </motion.h2>
          <motion.p
            variants={fadeIn}
            className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Join thousands of successful learners who have achieved 100%
            confidence in English speaking
          </motion.p>
          <motion.div
            variants={staggerContainer}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.a
              href="/signup/student"
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-medium px-8 py-3 rounded-md transition-all duration-200 hover:shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variants={fadeIn}
            >
              Enroll Now
            </motion.a>
            <motion.a
              href="/courses"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-md font-medium hover:bg-white/10 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variants={fadeIn}
            >
              View All Courses
            </motion.a>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-black to-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <BookOpen className="h-8 w-8 text-yellow-400" />
                <span className="ml-2 text-xl font-bold">PK International</span>
              </div>
              <p className="text-gray-400">
                Empowering professionals through innovative English language
                education and modern learning experiences.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/"
                    className="hover:text-yellow-400 transition-colors duration-200"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="hover:text-yellow-400 transition-colors duration-200"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/events"
                    className="hover:text-yellow-400 transition-colors duration-200"
                  >
                    Events
                  </Link>
                </li>
                <li>
                  <Link
                    href="/courses"
                    className="hover:text-yellow-400 transition-colors duration-200"
                  >
                    Courses
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Programs</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-yellow-400 transition-colors duration-200"
                  >
                    iCSE ALPHA
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-yellow-400 transition-colors duration-200"
                  >
                    iCSE BETA
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-yellow-400 transition-colors duration-200"
                  >
                    iCSE GAMMA
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-yellow-400 transition-colors duration-200"
                  >
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
                    LEVEL 3, NO G-15, JALAN USJ SENTRAL 1, USJ SENTRAL PERSIARAN
                    SUBANG 1, SUBANG JAYA, SELANGOR
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
            <p className="text-gray-400">
              &copy; 2024 PK International Business School. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a
                href="#"
                className="text-gray-400 hover:text-yellow-400 transition-colors duration-200"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-yellow-400 transition-colors duration-200"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-yellow-400 transition-colors duration-200"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-yellow-400 transition-colors duration-200"
              >
                <LinkedIn className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
