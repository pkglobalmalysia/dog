"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useAnimation, useInView } from "framer-motion";
import {
  BookOpen,
  CheckCircle,
  ChevronRight,
  Users,
  Menu,
  X,
  Facebook,
  Twitter,
  Instagram,
  LinkedinIcon as LinkedIn,
  Phone,
  Mail,
  MapPin,
  Clock,
  Layers,
  Zap,
  Book,
} from "lucide-react";
import TestimonialsSection from "@/components/testimonials";

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
type AnimatedSectionProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
};
const AnimatedSection = ({
  children,
  className = "",
  delay = 0,
  id,
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
  );
};

// Program Card Component
type Program = {
  id: string;
  title: string;
  features: string[];
  duration: string;
  price: string;
  image: string;
  description: string;
  category: string;
};

const ProgramCard = ({ program }: { program: Program }) => {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <div className="h-3 bg-gradient-to-r from-yellow-500 to-yellow-400"></div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-400 dark:group-hover:text-yellow-400 transition-colors duration-300">
          {program.title}
        </h3>
        <div className="space-y-3 mb-6">
          {program.features.map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-300">
                {feature}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-600 dark:text-gray-400">
              {program.duration}
            </span>
          </div>
          <div className="text-2xl font-bold">{program.price}</div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/programs/${program.id}`}
            className="bg-transparent border border-yellow-400 dark:border-yellow-400 text-yellow-400 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-5000 px-4 py-2 rounded-md font-medium flex items-center justify-center transition-colors duration-200"
          >
            View Details
            <ChevronRight className="ml-1 h-5 w-5" />
          </Link>
          <Link
            href="/signup/student"
            className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-400 text-white font-medium px-4 py-2 rounded-md transition-all duration-200 flex items-center justify-center"
          >
            Enroll Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default function ProgramsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sample programs data
  const programs = [
    {
      id: "icse-alpha",
      title: "iCSE Coaching™ Alpha Module",
      features: [
        "Ability to identify Fear Thoughts Phrases & Compassion Thought Phrases",
        "Ability to Speak English in the status of Energy Giver in Reciprocal Roles",
        "Ability to Speak phrases to reflect meanings from Reading & Listening activities",
      ],
      duration: "4 weeks",
      price: "",
      image: "/placeholder.svg?height=400&width=600",
      description:
        "The foundation level program designed to help you overcome the fear of speaking English and build your confidence in everyday conversations.",
      category: "English Speaking",
    },
    {
      id: "icse-beta",
      title: "iCSE Coaching™ Beta Module",
      features: [
        "Ability to Speak English Confidently in 3 Motives of Communication using precise phrases",
        "Ability to Speak English Confidently using precise Speaking Rhythm for 3 Motives of Communication",
        "Ability to Speak English Confidently by avoiding Fear Thought Phrases in 3 Motives of Communication",
      ],
      duration: "8 weeks",
      price: "",
      image: "/placeholder.svg?height=400&width=600",
      description:
        "Take your English speaking skills to the next level with our intermediate program focused on fluency and professional communication.",
      category: "English Speaking",
    },
    {
      id: "icse-gamma",
      title: "iCSE Coaching™ Gamma Module",
      features: [
        "Ability to Speak English Confidently in Self Introduction",
        "Ability to Speak English Confidently in Meetings & Formal situations for Discussions and also Brainstorming",
        "Ability to Speak English Confidently regarding experiences & traits for Video Resume also during interview",
      ],
      duration: "12 weeks",
      price: "",
      image: "/placeholder.svg?height=400&width=600",
      description:
        "Our advanced program for professionals who want to master high-level business English and leadership communication.",
      category: "English Speaking",
    },
    {
      id: "hvac",
      title: "Teknologi Penyejukbekuan dan Penyaman Udara",
      features: [
        "Installation techniques for HVAC systems",
        "Maintenance and troubleshooting",
        "Energy efficiency optimization",
        "Safety protocols and standards",
      ],
      duration: "16 weeks",
      price: "",
      image: "/placeholder.svg?height=400&width=600",
      description:
        "Comprehensive training in heating, ventilation, and air conditioning systems for technical professionals.",
      category: "Technical Skills",
    },
    {
      id: "electrical",
      title: "Teknologi Elektrik",
      features: [
        "Electrical wiring and installation",
        "Solar system setup and maintenance",
        "Electrical troubleshooting",
        "Safety standards and compliance",
      ],
      duration: "20 weeks",
      price: "",
      image: "/placeholder.svg?height=400&width=600",
      description:
        "Professional training in electrical systems, including renewable energy technologies and modern electrical installations.",
      category: "Technical Skills",
    },
    {
      id: "mechatronics",
      title: "Teknologi Mekatronik dan Automasi Industri",
      features: [
        "Robotics programming and control",
        "PLC systems implementation",
        "Automation system design",
        "Industry 4.0 technologies",
      ],
      duration: "24 weeks",
      price: "",
      image: "/placeholder.svg?height=400&width=600",
      description:
        "Advanced training in mechatronics and industrial automation for the modern manufacturing environment.",
      category: "Technical Skills",
    },
  ];

  // Featured program
  const featuredProgram = {
    id: "icse-confidence",
    title: " i Can Speak English iCSE Coaching™",
    description:
      "Speak English 100% Confidently with our specialized courses designed for both students and adults. Join thousands of successful learners who transformed their communication skills.",
    features: [
      "Lifetime Habits To Speak English Confidently And Compassionately",
      "Free From Grammar Stress",
      "Free From Vocabulary Stress",
      "Focuses On Speaking Phrases",
    ],
    image: "/events/event3-4.jpg",
  };

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
              <Link
                href="/login"
                className="text-white hover:text-yellow-400 transition-colors duration-200"
              >
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

      {/* Hero Section */}
      <section className="relative bg-cover bg-center h-[60vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/events/event3-1.jpeg"
            alt="Programs background"
            fill
            className="object-cover"
            priority
          />
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
              Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-500">
                Programs
              </span>
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 my-6"></div>
            <p className="text-xl text-gray-200 max-w-2xl">
              Find the perfect English speaking program to boost your confidence
              and advance your career, or explore our technical skills training
              for professional development.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <motion.a
                href="#english-programs"
                className="bg-yellow-400 text-black px-6 py-3 rounded-md font-medium flex items-center hover:bg-gray-100 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                English Programs <ChevronRight className="ml-2 h-5 w-5" />
              </motion.a>
              <motion.a
                href="#technical-programs"
                className="bg-transparent border-2 border-yellow-400 text-yellow-400 px-6 py-3 rounded-md font-medium flex items-center hover:bg-white/10 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Technical Programs <ChevronRight className="ml-2 h-5 w-5" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Program Section */}
      <AnimatedSection className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeIn}>
              <span className="text-yellow-400 dark:text-yellow-400 font-semibold">
                FEATURED PROGRAM
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
                {featuredProgram.title}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {featuredProgram.description}
              </p>
              <div className="space-y-4 mb-8">
                {featuredProgram.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.a
                  href={`/programs/${featuredProgram.id}`}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-400 text-white font-medium px-6 py-3 rounded-md transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Speaking English
                </motion.a>
                <motion.a
                  href={`/programs/${featuredProgram.id}`}
                  className="bg-transparent border border-yellow-400 dark:border-yellow-400 text-yellow-400 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-5000 px-6 py-3 rounded-md font-medium flex items-center justify-center transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Program Details
                  <ChevronRight className="ml-2 h-5 w-5" />
                </motion.a>
              </div>
            </motion.div>
            <motion.div variants={scaleIn} className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-xl blur-lg opacity-30 animate-pulse"></div>
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <Image
                  src={featuredProgram.image || "/placeholder.svg"}
                  alt={featuredProgram.title}
                  width={400}
                  height={200}
                  className="w-full h-150 object-cover rounded-lg"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Program Description */}
      <AnimatedSection className="py-20 bg-gradient-to-r from-yellow-50 to-yellow-50 dark:from-yellow-5000 dark:to-yellow-5000">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <motion.div variants={fadeIn} className="text-center">
              <h2 className="text-3xl font-bold mb-6">
                About our i Can Speak English iCSE Coaching™
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                The iCSE Coaching program is a revolutionary approach to English
                language mastery. Utilizing two groundbreaking trademark models
                - the Chaarran Model and the PARi Model - we instill 100%
                confidence in English communication, covering both dialogue and
                monologue scenarios.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Our program is designed to eliminate fears of grammar mistakes,
                vocabulary limitations, and pronunciation struggles, replacing
                them with positive, reinforcing behaviors in listening, reading,
                and speaking.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-6 mt-12"
            >
              <motion.div variants={fadeIn} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 flex items-center justify-center mx-auto mb-4">
                  <Layers className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold mb-2">Structured Approach</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Progressive learning path from foundation to advanced levels
                </p>
              </motion.div>
              <motion.div variants={fadeIn} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold mb-2">Rapid Results</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  See noticeable improvement in your confidence within weeks
                </p>
              </motion.div>
              <motion.div variants={fadeIn} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 flex items-center justify-center mx-auto mb-4">
                  <Book className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold mb-2">Practical Focus</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Real-world scenarios and workplace communication skills
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* English Programs Section */}
      <AnimatedSection id="english-programs" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              {" "}
              i Can Speak English iCSE Coaching™
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-500 to-yellow-400 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our i Can Speak English iCSE Coaching™ is designed to optimize
              your English speaking skills, build your confidence, and empower
              you to excel in your corporate career. Choose the level that best
              suits your needs and goals.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {programs
              .filter((program) => program.category === "English Speaking")
              .map((program) => (
                <motion.div key={program.id} variants={scaleIn}>
                  <ProgramCard program={program} />
                </motion.div>
              ))}
          </motion.div>

          <motion.div
            variants={fadeIn}
            className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">CUSTOM PROGRAMS</h3>
                  <p className="text-gray-500">
                    Tailored programs for corporate needs
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Customized curriculum based on company needs
                    </span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">
                      One-on-one coaching available for executives
                    </span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Flexible scheduling to accommodate work hours
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Industry-specific vocabulary and scenarios
                    </span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Progress tracking and reporting for management
                    </span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Group discounts for corporate teams
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <motion.a
                  href="/contact"
                  className="bg-transparent border border-yellow-400 dark:border-yellow-400 text-yellow-400 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-5000 px-6 py-3 rounded-md font-medium inline-flex items-center transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Request Corporate Training
                  <ChevronRight className="ml-2 h-5 w-5" />
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      <TestimonialsSection />

      {/* CTA Section */}
      <AnimatedSection className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            variants={fadeIn}
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            Ready to Transform Your Skills?
          </motion.h2>
          <motion.p
            variants={fadeIn}
            className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Join thousands of successful learners who have achieved 100%
            confidence in English speaking or advanced their technical careers
          </motion.p>
          <motion.div
            variants={staggerContainer}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.a
              href="/signup/student"
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-yellow-900 font-medium px-8 py-3 rounded-md transition-all duration-200 hover:shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variants={fadeIn}
            >
              Enroll Now
            </motion.a>
            <motion.a
              href="/events"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-md font-medium hover:bg-white/10 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variants={fadeIn}
            >
              Attend a Free Workshop
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
                    href="/programs"
                    className="hover:text-yellow-400 transition-colors duration-200"
                  >
                    Programs
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
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Programs</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/programs/icse-alpha"
                    className="hover:text-yellow-400 transition-colors duration-200"
                  >
                    iCSE ALPHA
                  </Link>
                </li>
                <li>
                  <Link
                    href="/programs/icse-beta"
                    className="hover:text-yellow-400 transition-colors duration-200"
                  >
                    iCSE BETA
                  </Link>
                </li>
                <li>
                  <Link
                    href="/programs/icse-gamma"
                    className="hover:text-yellow-400 transition-colors duration-200"
                  >
                    iCSE GAMMA
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-yellow-400 transition-colors duration-200"
                  >
                    Corporate Training
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
