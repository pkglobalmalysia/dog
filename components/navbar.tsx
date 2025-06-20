"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { BookOpen, Menu, X } from "lucide-react"

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-black text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <BookOpen className="h-8 w-8 text-yellow-400" />
              <span className="ml-2 text-xl font-bold">PK International</span>
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <Link href="/" className="text-gray-300 hover:text-yellow-400 font-medium transition-colors duration-200">
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
                className="text-gray-300 hover:text-yellow-400 font-medium transition-colors duration-200"
              >
                Events
              </Link>
              
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/signup/student" className="text-white hover:text-yellow-400 transition-colors duration-200">
              Sign Up
            </Link>
            <Link
              href="/login"
              className="bg-gradient-to-r from-yellow-400 to-yellow-400 hover:from-yellow-400 hover:to-yellow-400 text-black font-medium px-4 py-2 rounded-md transition-all duration-200 hover:shadow-lg"
            >
             Student Dashboard
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
              className="block text-gray-300 hover:text-yellow-400 font-medium transition-colors duration-200"
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
                href="/signup/student"
                className="text-white hover:text-yellow-400 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
              <Link
                href="/login"
                className="bg-gradient-to-r from-yellow-400 to-yellow-400 hover:from-yellow-400 hover:to-yellow-400 text-black font-medium px-4 py-2 rounded-md transition-all duration-200 hover:shadow-lg inline-block text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Student Dashboard
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  )
}
