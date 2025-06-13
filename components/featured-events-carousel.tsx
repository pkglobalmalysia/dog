"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Users } from "lucide-react"
import { useCallback } from "react"

// Animation variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      opacity: { duration: 0.4 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      opacity: { duration: 0.4 },
    },
  }),
}

export type Event = {
  id: string
  title: string
  date: string
  location: string
  image?: string
  description: string
  category?: string
  highlights?: string[]
}

interface FeaturedEventsCarouselProps {
  events: Event[]
  autoPlay?: boolean
  interval?: number
}

export default function FeaturedEventsCarousel({
  events,
  autoPlay = true,
  interval = 5000,
}: FeaturedEventsCarouselProps) {
  const [[currentIndex, direction], setCurrentIndex] = useState([0, 0])
  const [isPaused, setIsPaused] = useState(false)

  const maxIndex = events.length - 1

  const nextSlide = useCallback(() => {
  setCurrentIndex((prev) => {
    const newIndex = prev[0] === maxIndex ? 0 : prev[0] + 1
    return [newIndex, 1]
  })
}, [maxIndex, setCurrentIndex])

  // Handle previous slide with direction
  const prevSlide = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev[0] === 0 ? maxIndex : prev[0] - 1
      return [newIndex, -1]
    })
  }

  // Go to specific slide
  const goToSlide = (index: number) => {
    setCurrentIndex((prev) => [index, index > prev[0] ? 1 : -1])
  }

  // Auto play functionality
  useEffect(() => {
    if (!autoPlay || isPaused || events.length <= 1) return

    const timer = setInterval(() => {
      nextSlide()
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, isPaused, interval, events.length, nextSlide])

  if (events.length === 0) {
    return null
  }

  return (
    <div className="relative" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div className="overflow-hidden rounded-xl">
        <div className="relative">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border-t-4 border-yellow-400">
                <div className="md:flex">
                  <div className="md:w-1/2 relative">
                    <div className="h-64 md:h-full relative">
                      <Image
                        src={events[currentIndex].image || "/placeholder.svg"}
                        alt={events[currentIndex].title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute top-0 left-0 bg-gradient-to-r from-yellow-400 to-yellow-400 text-white text-sm font-bold px-4 py-2 rounded-br-lg">
                      Featured
                    </div>
                  </div>
                  <div className="md:w-1/2 p-8">
                    <h3 className="text-2xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-400">
                      {events[currentIndex].title}
                    </h3>
                    <div className="flex items-center mb-6">
                      <span className="text-gray-600 dark:text-gray-400">{events[currentIndex].date}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">{events[currentIndex].description}</p>

                    {events[currentIndex].highlights && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3 flex items-center">
                          <Users className="h-5 w-5 text-yellow-400 mr-2" /> Event Highlights
                        </h4>
                        <ul className="space-y-2">
                          {events[currentIndex].highlights.slice(0, 3).map((highlight, index) => (
                            <motion.li
                              key={index}
                              className="flex items-start"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * index }}
                            >
                              <div className="bg-gradient-to-r from-yellow-400/20 to-yellow-400/20 rounded-full p-1 mr-3 mt-0.5">
                                <span className="text-yellow-400 dark:text-yellow-400 font-bold text-sm">✓</span>
                              </div>
                              <span className="text-gray-600 dark:text-gray-300">{highlight}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4">
                      <motion.a
                        href={`/events/${events[currentIndex].id}`}
                        className="bg-gradient-to-r from-yellow-400 to-yellow-400 hover:from-yellow-400 hover:to-yellow-700 text-white font-medium px-6 py-3 rounded-md transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Learn More
                      </motion.a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation buttons */}
      {events.length > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <motion.button
            onClick={prevSlide}
            className="bg-white dark:bg-gray-800 text-yellow-400 dark:text-yellow-400 p-2 rounded-full shadow-md hover:bg-yellow-50 dark:hover:bg-gray-700 transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </motion.button>
          <motion.button
            onClick={nextSlide}
            className="bg-white dark:bg-gray-800 text-yellow-400 dark:text-yellow-400 p-2 rounded-full shadow-md hover:bg-yellow-50 dark:hover:bg-gray-700 transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </motion.button>
        </div>
      )}

      {/* Indicator dots */}
      {events.length > 1 && (
        <div className="flex justify-center mt-4">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-3 w-3 rounded-full mx-1.5 transition-all duration-300 ${
                index === currentIndex ? "bg-yellow-400 scale-110" : "bg-gray-300 dark:bg-gray-600"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? "true" : "false"}
            />
          ))}
        </div>
      )}
    </div>
  )
}
