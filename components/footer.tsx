import Link from "next/link"
import { BookOpen, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export default function Footer() {
  return (
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
                <Link href="/courses" className="hover:text-yellow-400 transition-colors duration-200">
                  Courses
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
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center md:text-left">
          <p className="text-gray-400">&copy; 2024 PK International Business School. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
