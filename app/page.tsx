"use client";

import { useAuth } from "@/components/auth-provider";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";
import Navbar from "@/components/navbar";

import {
  BookOpen,
  Users,
  CheckCircle,
  GraduationCap,
  Globe,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  LinkedinIcon as LinkedIn,
  Award,
  Headphones,
} from "lucide-react";
import TestimonialsSection from "@/components/testimonials";

export default function HomePage() {
  const { isLoading } = useAuth();
  const images = ["/flyer1.jpg", "/flyer2.jpg", "/flyer3.jpeg"];
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const interval = setInterval(scrollNext, 5000);
    return () => clearInterval(interval);
  }, [emblaApi, scrollNext]);

  // Remove automatic redirect logic from home page
  // Let the auth provider handle redirects to avoid conflicts

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffc107]"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center px-4 pt-32 pb-16 bg-black">
        {/* Left Logo */}
        <div className="absolute left-8 top-8 hidden lg:block z-20">
          <div className="text-center">
            <div className="w-64  h-40 mx-16  flex items-center justify-center mb-3 overflow-hidden ">
              <Image
                src="/globe.png"
                alt="Company Logo"
                width={500}
                height={200}
                className="w-64 h-40 object-fit "
              />
            </div>
            <div className="text-white text-md font-bold tracking-wide">
              Strength Management & Trading <br /> Sdn. Bhd. (955060-H)
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl text-white md:text-3xl lg:text-5xl font-bold leading-tight mb-6">
            iCSE Coaching™ -
            <span className="text-[#ffc107]">
              {" "}
              Lifetime Habits To Speak English Confidently And Compassionately{" "}
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Malaysia's No.1 Trademark Model Approach to provide Lifetime Habit
            to Speak English Confidently and Compassionately. iCSE Coaching™
            enables each participant to gain Lifetime Habit in Speaking English
            with Confidence & Compassion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup/student"
              className="bg-[#ffc107] hover:bg-[#e6af06] text-black font-bold py-3 px-8 rounded transition-all"
            >
              Start Learning Today
            </Link>
            <Link
              href="/programs"
              className="border-2 border-[#ffc107] text-[#ffc107] hover:bg-[#ffc107] hover:text-black font-bold py-3 px-8 rounded transition-all"
            >
              Explore Courses
            </Link>
          </div>
        </div>

        {/* Right Certification Badges */}
        <div className="absolute right-8 top-8 hidden lg:block z-20">
          <div className="flex flex-row space-x-6">
            {/* International Certification Badge */}
            <div className="text-center">
              <div className="w-36 h-36 mx-7 rounded-full backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-lg">
                <Image
                  src="/logo.png"
                  alt="International Certification"
                  width={500}
                  height={200}
                  className="w-36 h-36 object-contain"
                />
              </div>
              <div className="text-white text-md font-bold mt-2 tracking-wide">
                PK International Business <br /> School
              </div>
            </div>

            {/* Registered Badge */}
            <div className="text-center">
              <div className="w-36 h-36 bg-white rounded-full backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-lg">
                <Image
                  src="/hrd1.png"
                  alt="Registered Certification"
                  width={500}
                  height={200}
                  className="w-36 h-36 object-contain"
                />
              </div>
              <div className="text-white text-md font-bold mt-2 tracking-wide">
                TP Number: <br /> 201101026924
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learn. Build. Grow. Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="overflow-hidden rounded-lg" ref={emblaRef}>
              <div className="flex">
                {images.map((src, index) => (
                  <div className="min-w-full" key={index}>
                    <Image
                      src={src}
                      alt={`iCSE Malaysia English Course - Professional Training Program ${
                        index + 1
                      }`}
                      width={500}
                      height={200}
                      className="object-fit rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Learn English.{" "}
                <span className="text-[#ffc107]">Build Confidence.</span> Grow
                Career.
              </h2>
              <div className="w-20 h-1 bg-[#ffc107] mb-6"></div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                <strong>iCSE Malaysia</strong> is committed to transforming
                careers through our innovative
                <em> English speaking programs in Malaysia</em>. Our impact
                speaks volumes through the success of our 10,000+ students who
                have achieved 100% confidence in their professional English
                communication.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-8">
                Using our revolutionary{" "}
                <strong>Chaarran and PARi Models</strong>, we help Malaysian
                professionals overcome the fear of making mistakes while
                speaking English, enabling them to excel in their corporate
                careers with <em>fluent English speaking skills</em>.
              </p>
              <Link
                href="/about"
                className="bg-[#ffc107] hover:bg-[#e6af06] text-[#0a2540] font-bold py-3 px-6 rounded-md transition-all inline-flex items-center"
                title="Learn more about iCSE Malaysia English courses"
              >
                Learn More About Our English Programs
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-black py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Why Choose iCSE Coaching™
            </h2>
            <div className="w-24 h-1 bg-[#ffc107] mx-auto mb-6"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Malaysia's #1 English iCSE Coaching™ that solely based on Rukun
              Negara ke-5, “Kesopanan dan Kesisulaan”. Coaching program that are
              free from grammar stress, free from vocabulary stress, focuses on
              speaking phrases and focuses on speaking rythm
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#ffc107] p-6 rounded-lg text-center">
              <div className="text-[#0a2540] text-4xl font-bold mb-2">
                10,000+
              </div>
              <div className="text-[#0a2540] font-medium">
                Professionals Trained Successfully in English Speaking
              </div>
            </div>
            <div className="bg-[#ffc107] p-6 rounded-lg text-center">
              <div className="text-[#0a2540] text-4xl font-bold mb-2">99%</div>
              <div className="text-[#0a2540] font-medium">
                Success Rate - Guaranteed English Fluency Results
              </div>
            </div>
            <div className="bg-[#ffc107] p-6 rounded-lg text-center">
              <div className="text-[#0a2540] text-4xl font-bold mb-2">15+</div>
              <div className="text-[#0a2540] font-medium">
                Years of Excellence in English Training Malaysia
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              English Speaking Programs We Offer in Malaysia
            </h2>
            <div className="w-24 h-1 bg-[#ffc107] mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our comprehensive <strong>English speaking courses</strong> are
              designed specifically for Malaysian professionals to master
              English communication in workplace settings
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 rounded-full bg-[#ffc107] flex items-center justify-center text-[#0a2540] mx-auto mb-4">
                <GraduationCap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">
                iCSE Coaching™ : Alpha Module{" "}
              </h3>
              <ul className="text-gray-600 dark:text-gray-400 mb-6 list-disc list-inside text-left space-y-2">
                <li>
                  Ability to identify <strong>Fear Thoughts Phrases</strong> &{" "}
                  <strong>Compassion Thought Phrases</strong>
                </li>
                <li>
                  Ability to speak English as an <strong>Energy Giver</strong>{" "}
                  in Reciprocal Roles
                </li>
                <li>
                  Ability to speak phrases to reflect meanings from{" "}
                  <strong>Reading & Listening</strong> activities
                </li>
              </ul>
              <Link
                href="/programs"
                className="text-[#ffc107] hover:text-[#e6af06] font-medium inline-flex items-center"
                title="Learn more about beginner English course in Malaysia"
              >
                Learn More <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 rounded-full bg-[#ffc107] flex items-center justify-center text-[#0a2540] mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">
                iCSE Coaching™ : Beta Module
              </h3>
              <ul className="text-gray-600 dark:text-gray-400 mb-6 list-disc list-inside text-left space-y-2">
                <li>
                  Ability to Speak English Confidently in{" "}
                  <strong>3 Motives of Communication</strong> using precise
                  phrases.
                </li>
                <li>
                  Ability to Speak English Confidently using precise{" "}
                  <strong>Speaking Rhythm</strong> for 3 Motives of
                  Communication.
                </li>
                <li>
                  Ability to Speak English Confidently by avoiding{" "}
                  <strong>Fear Thought Phrases</strong> in 3 Motives of
                  Communication.
                </li>
              </ul>
              <Link
                href="/programs"
                className="text-[#ffc107] hover:text-[#e6af06] font-medium inline-flex items-center"
                title="Intermediate English speaking course Malaysia"
              >
                Learn More <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 rounded-full bg-[#ffc107] flex items-center justify-center text-[#0a2540] mx-auto mb-4">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">
                iCSE Coaching™ : Gamma Module
              </h3>
              <ul className="text-gray-600 dark:text-gray-400 mb-6 list-disc list-inside text-left space-y-2">
                <li>
                  Ability to Speak English Confidently in{" "}
                  <strong>Self Introduction</strong>.
                </li>
                <li>
                  Ability to Speak English Confidently in{" "}
                  <strong>Meetings & Formal situations</strong> for discussions
                  and brainstorming.
                </li>
                <li>
                  Ability to Speak English Confidently regarding{" "}
                  <strong>experiences & traits</strong> for video resume and
                  during interviews.
                </li>
              </ul>
              <Link
                href="/programs"
                className="text-[#ffc107] hover:text-[#e6af06] font-medium inline-flex items-center"
                title="Advanced business English course Malaysia"
              >
                Learn More <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Trusted by HRD Corp Malaysia
              </h2>
              <div className="w-24 h-1 bg-[#ffc107] mb-6"></div>
              <p className="text-white/80 text-lg mb-6">
                PK International Business School is an{" "}
                <span className="text-white font-semibold">
                  HRD Corp accredited training provider
                </span>{" "}
                under the Ministry of Human Resources, Malaysia. Our programs
                are fully claimable, designed to upgrade corporate communication
                skills.
              </p>

              <ul className="space-y-5 text-white/90">
                <li className="flex items-start">
                  <CheckCircle className="text-[#ffc107] w-6 h-6 mt-1" />
                  <span className="ml-3">
                    <strong>TP Number:</strong> TP201101026924
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-[#ffc107] w-6 h-6 mt-1" />
                  <span className="ml-3">
                    <strong>Program Number:</strong> 10001561679 | 10001564414 |
                    10001563663
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-[#ffc107] w-6 h-6 mt-1" />
                  <span className="ml-3">
                    100% Claimable for Eligible Malaysian Employers
                  </span>
                </li>
              </ul>
            </div>

            {/* Logos / Certificates */}
            <div className="flex flex-col items-center gap-6 md:items-start">
              <div className="flex flex-row gap-4">
                <div className="bg-white rounded-full shadow-xl flex items-center justify-center">
                  <Image
                    src="/hrd1.png"
                    alt="HRD Corp Logo"
                    width={200}
                    height={100}
                    className="object-contain h-auto"
                  />
                </div>
                <div>
                  <Image
                    src="/hrd3.png"
                    alt="HRD Corp Certificate"
                    width={200}
                    height={100}
                    className="object-contain bg-white rounded-full h-auto"
                  />
                </div>
              </div>
              <div className=" p-4 rounded-xl shadow-xl w-64 h-40 flex items-center justify-center">
                <Image
                  src="/hrd2.jpg"
                  alt="HRD Corp Certificate"
                  width={200}
                  height={100}
                  className="object-contain h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TestimonialsSection />
        </div>
      </section>

      {/* What You'll Gain Section */}
      <section className="py-16 md:py-24 bg-[#ffc107]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0a2540] mb-6">
                What you will gain from iCSE Coaching™{" "}
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-[#0a2540]" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-[#0a2540]">
                      99% FREE FROM GRAMMAR STRESS{" "}
                    </h3>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-[#0a2540]" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-[#0a2540]">
                      99% FREE FROM VOCABULARY STRESS
                    </h3>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-[#0a2540]" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-[#0a2540]">
                      80% FOCUSES ON SPEAKING PHRASES & RHYTHM
                    </h3>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-[#0a2540]" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-[#0a2540]">
                      LIFETIME HABITS TO SPEAK ENGLISH WITH 100% CONFIDENCE
                    </h3>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Image
                width={600}
                height={400}
                src="/pk1.jpg"
                alt="Professional speaking"
                className="rounded-lg shadow-lg object-none"
              />
              <Image
                width={600}
                height={400}
                src="/pk2.jpg"
                alt="Graduate"
                className="rounded-lg shadow-lg mt-6"
              />
              <Image
                width={600}
                height={400}
                src="/pk3.jpg"
                alt="Business presentation"
                className="rounded-lg shadow-lg"
              />
              <Image
                width={600}
                height={400}
                src="/pk4.jpg"
                alt="Networking"
                className="rounded-lg shadow-lg mt-6 "
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Contact Us
              </h2>
              <form
                className="space-y-6"
                action="https://formspree.io/f/xrblgznl"
                method="POST"
              >
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#ffc107]"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#ffc107]"
                      placeholder="+60 12 345 6789"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#ffc107]"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject
                  </label>
                  <select
                    name="subject"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#ffc107]"
                  >
                    <option>Course Inquiry</option>
                    <option>Corporate Training</option>
                    <option>General Question</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    name="message"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#ffc107]"
                    rows={4}
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <div>
                  <button
                    type="submit"
                    className="bg-[#ffc107] hover:bg-[#e6af06] text-[#0a2540] font-bold py-3 px-6 rounded-md transition-all w-full"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
            <div className="bg-black text-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Get In Touch
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <Phone className="h-6 w-6 text-[#ffc107] mr-4" />
                  <div>
                    <h3 className="font-bold mb-1">Phone</h3>
                    <p>+60 03-80116996</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="h-6 w-6 text-[#ffc107] mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Email</h3>
                    <div className="flex items-center mb-1">
                      <span className="font-medium w-28">For Support:</span>
                      <a
                        href="mailto:admin@pkibs.com"
                        className=" hover:underline"
                      >
                        admin@pkibs.com
                      </a>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium w-28">For Admin:</span>
                      <a
                        href="mailto:admin@pkibs.com"
                        className=" hover:underline"
                      >
                        admin@pkibs.com
                      </a>
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-[#ffc107] mr-4" />
                  <div>
                    <h3 className="font-bold mb-1">Address</h3>
                    <p>LEVEL 3, NO G-15, JALAN USJ SENTRAL,</p>
                    <p>USJ SENTRAL PERSIARAN SUBANG 1,</p>
                    <p>SUBANG JAYA, SELANGOR</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold mb-3">Follow Us</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="text-white hover:text-[#ffc107]">
                      <Facebook className="h-6 w-6" />
                    </a>
                    <a href="#" className="text-white hover:text-[#ffc107]">
                      <Twitter className="h-6 w-6" />
                    </a>
                    <a href="#" className="text-white hover:text-[#ffc107]">
                      <Instagram className="h-6 w-6" />
                    </a>
                    <a href="#" className="text-white hover:text-[#ffc107]">
                      <LinkedIn className="h-6 w-6" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your English Skills?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of successful learners who have achieved 100%
            confidence in English speaking
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup/student"
              className="bg-[#ffc107] hover:bg-[#e6af06] text-[#0a2540] font-bold py-3 px-6 rounded-md transition-all"
            >
              Enroll Now
            </Link>
            <Link
              href="/programs"
              className="border-2 border-[#ffc107] text-[#ffc107] hover:bg-[#ffc107] hover:text-[#0a2540] font-bold py-3 px-6 rounded-md transition-all"
            >
              View All Programs
            </Link>
          </div>
        </div>
      </section>

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
