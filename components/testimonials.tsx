"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 },
  },
};

// Animated Section Component
const AnimatedSection = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

const testimonials = [
  {
    id: 1,
    name: " iCSE Coaching Trainee",
    initials: "ICSE",
    rating: 5,
    text: "Most participants experienced a significant increase in confidence speaking English, both in  personal and professional settings.",
  },
  {
    id: 2,
    name: " iCSE Coaching Trainee",
    initials: "ICSE",
    rating: 5,
    text: "Trainees appreciated learning how to speak with compassion, humility, and professionalism,in line with the CHAARRAN model.",
  },
  {
    id: 3,
    name: " iCSE Coaching Trainee",
    initials: "ICSE",
    rating: 5,
    text: "They gained simple yet powerful techniques to speak and read confidently, with some also applying the techniques in Bahasa Malaysia.",
  },
  {
    id: 4,
    name: " iCSE Coaching Trainee",
    initials: "ICSE",
    rating: 5,
    text: "The training helped them improve their self-worth, professionalism, and communication style, both at work and in daily life.",
  },
];

export default function TestimonialsSection() {
  return (
    <AnimatedSection className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeIn} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            What Our Students Say
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#ffc107] to-[#e6af06] mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Hear from our students who have transformed their English speaking
            skills and advanced their careers
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-8"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={scaleIn}
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              {/* Star Rating */}
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-5 w-5 text-[#ffc107]"
                    fill="currentColor"
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-600 dark:text-gray-400 mb-6 italic text-lg leading-relaxed">
                {testimonial.text}
              </p>

              {/* Author Info */}
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#ffc107] to-[#e6af06] flex items-center justify-center">
                  <span className="font-bold text-[#0a2540]">
                    {testimonial.initials}
                  </span>
                </div>
                <div className="ml-4">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </p>
                  
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div variants={fadeIn} className="text-center mt-16">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <a
              href="/signup/student"
              className="inline-flex items-center bg-[#ffc107] hover:bg-[#e6af06] text-[#0a2540] font-bold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Join Our Success Stories
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </motion.div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Start your English transformation journey today
          </p>
        </motion.div>
      </div>
    </AnimatedSection>
  );
}
