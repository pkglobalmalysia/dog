import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { generateSEOMetadata, jsonLd } from '@/lib/seo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Star, Users, Award, Globe } from 'lucide-react'

export const metadata: Metadata = generateSEOMetadata({
  title: "Learn English in Malaysia | #1 English Course | iCSE Malaysia",
  description: "Learn English in Malaysia with iCSE's proven method. 10,000+ professionals achieved fluency. Best English speaking course in Malaysia with guaranteed results. Join today!",
  keywords: [
    "learn english in malaysia",
    "english course malaysia", 
    "english classes malaysia",
    "english training kuala lumpur",
    "spoken english malaysia",
    "business english course kl"
  ]
})

export default function LearnEnglishMalaysiaPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Add structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd.course)
        }}
      />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Learn English in <span className="text-yellow-400">Malaysia</span>
                <br />
                <span className="text-yellow-400">Guaranteed Results</span>
              </h1>
              <h2 className="text-xl md:text-2xl mb-6 text-blue-100">
                #1 English Speaking Course in Malaysia | iCSE Coaching Program
              </h2>
              <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                Master English speaking with Malaysia&apos;s most effective program. Join 10,000+ professionals 
                who achieved 100% confidence through our proven <strong>i Can Speak English (iCSE)</strong> methodology.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button asChild size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
                  <Link href="/signup/student">Start Learning English Today</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
                  <Link href="/courses">View All English Courses</Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-yellow-400" />
                  <span>10,000+ Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  <span>99% Success Rate</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <Image
                src="/globe.jpeg"
                alt="Learn English in Malaysia - iCSE Professional English Course"
                width={600}
                height={400}
                className="rounded-2xl shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Learn English in Malaysia with iCSE */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Learn English in Malaysia with iCSE?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Discover why thousands of Malaysian professionals choose iCSE for their English learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Globe className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Malaysia-Focused Curriculum</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Our English courses are specifically designed for Malaysian workplace culture, 
                  business contexts, and communication styles. Learn English that works in Malaysia&apos;s corporate environment.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Proven Track Record</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Over 10,000 Malaysian professionals have successfully completed our English speaking programs 
                  with a 99% success rate. Join Malaysia&apos;s largest community of confident English speakers.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-yellow-600" />
                </div>
                <CardTitle>Guaranteed Results</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Our unique iCSE methodology guarantees English fluency improvement. 
                  If you don&apos;t see results within 3 months, we&apos;ll continue your training at no extra cost.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* English Courses Available */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              English Courses Available in Malaysia
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Choose from our comprehensive range of English speaking programs designed for Malaysian professionals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-center">iCSE Alpha - Beginner</CardTitle>
                <CardDescription className="text-center">Perfect for English learning beginners</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">RM 1,200</div>
                  <div className="text-sm text-gray-500">3-month program</div>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Foundation English speaking skills</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Overcome fear of speaking English</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Basic business English communication</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Weekly practice sessions</span>
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/signup/student">Enroll in Beginner English</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow border-2 border-yellow-400">
              <CardHeader>
                <CardTitle className="text-center">iCSE Beta - Intermediate</CardTitle>
                <CardDescription className="text-center">Most popular English course</CardDescription>
                <div className="text-center">
                  <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">MOST POPULAR</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">RM 1,800</div>
                  <div className="text-sm text-gray-500">4-month program</div>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Advanced English fluency</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Professional presentation skills</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Business meeting English</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Personalized coaching sessions</span>
                  </li>
                </ul>
                <Button asChild className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">
                  <Link href="/signup/student">Enroll in Intermediate English</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-center">iCSE Gamma - Advanced</CardTitle>
                <CardDescription className="text-center">For English mastery and leadership</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">RM 2,500</div>
                  <div className="text-sm text-gray-500">6-month program</div>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Executive English communication</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Leadership English skills</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">International business English</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">1-on-1 executive coaching</span>
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/signup/student">Enroll in Advanced English</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Success Stories: Learn English in Malaysia
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              See how our students transformed their careers by learning English with iCSE
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-blue-600">AH</span>
                  </div>
                  <h3 className="font-bold">Ahmad Hassan</h3>
                  <p className="text-sm text-gray-500">Marketing Manager, Kuala Lumpur</p>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm italic">
                  &quot;iCSE helped me learn English fluently in just 4 months. Now I confidently lead international meetings. 
                  Best English course in Malaysia!&quot;
                </p>
                <div className="flex justify-center mt-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto bg-pink-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-pink-600">SL</span>
                  </div>
                  <h3 className="font-bold">Sarah Lim</h3>
                  <p className="text-sm text-gray-500">HR Director, Penang</p>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm italic">
                  &quot;Learning English in Malaysia was never this easy. iCSE&apos;s method is revolutionary. 
                  I speak English 100% confidently now in all business situations.&quot;
                </p>
                <div className="flex justify-center mt-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-green-600">RK</span>
                  </div>
                  <h3 className="font-bold">Raj Kumar</h3>
                  <p className="text-sm text-gray-500">IT Manager, Johor Bahru</p>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm italic">
                  &quot;From zero confidence to presenting in English to 200+ people. iCSE Malaysia 
                  transformed my career completely. Highly recommend!&quot;
                </p>
                <div className="flex justify-center mt-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Learn English in Malaysia?
          </h2>
          <p className="text-xl mb-8">
            Join 10,000+ professionals who chose iCSE Malaysia for English learning success. 
            Start your English fluency journey today with our proven methodology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
              <Link href="/signup/student">Start Learning English Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
              <Link href="/courses">View All English Courses</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
