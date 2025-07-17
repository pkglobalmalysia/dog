import type { Metadata } from 'next'
import Link from 'next/link'
import { generateSEOMetadata } from '@/lib/seo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Building, Users, TrendingUp, Globe, Star, Award } from 'lucide-react'

export const metadata: Metadata = generateSEOMetadata({
  title: "English Speaking Course Malaysia | Business English Training | iCSE",
  description: "Master English speaking with Malaysia&apos;s #1 business English course. Professional English training for corporate success. Join 10,000+ confident speakers. Guaranteed fluency results!",
  keywords: [
    "english speaking course",
    "english speaking course malaysia",
    "business english course",
    "professional english training",
    "corporate english malaysia",
    "english communication skills",
    "english fluency course malaysia"
  ]
})

export default function EnglishSpeakingCoursePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 bg-yellow-400 text-black font-bold px-4 py-2">
              #1 English Speaking Course in Malaysia
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Master <span className="text-yellow-400">English Speaking</span>
              <br />
              Transform Your <span className="text-yellow-400">Career</span>
            </h1>
            <h2 className="text-2xl md:text-3xl mb-6 text-purple-100 font-semibold">
              Professional English Speaking Course for Malaysian Professionals
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join Malaysia&apos;s most effective <strong>English speaking course</strong>. Our proven iCSE methodology 
              has helped 10,000+ professionals achieve 100% confidence in English communication. 
              Guaranteed results in 3 months!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button asChild size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
                <Link href="/signup/student">Enroll in English Speaking Course</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
                <Link href="/courses">View Course Details</Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-yellow-400">10,000+</div>
                <div className="text-sm text-purple-200">Students Trained</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-400">99%</div>
                <div className="text-sm text-purple-200">Success Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-400">15+</div>
                <div className="text-sm text-purple-200">Years Experience</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-400">4.9★</div>
                <div className="text-sm text-purple-200">Student Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Our English Speaking Course */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Our English Speaking Course in Malaysia?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Discover what makes iCSE Malaysia the #1 choice for professional English speaking training
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Corporate-Focused Training</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Our <strong>English speaking course</strong> is specifically designed for Malaysian corporate environments. 
                  Learn business English that directly applies to your workplace success.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Proven iCSE Methodology</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Our revolutionary <em>i Can Speak English</em> methodology eliminates fear and builds confidence. 
                  99% of our students achieve fluency within 3-6 months.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Expert English Trainers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Learn from Malaysia&apos;s top English communication experts with 15+ years of corporate training experience. 
                  Personalized coaching for maximum results.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <Globe className="h-8 w-8 text-yellow-600" />
                </div>
                <CardTitle>Flexible Learning Options</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Choose from online, in-person, or hybrid <strong>English speaking courses</strong>. 
                  Weekend and evening classes available for working professionals.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle>Guaranteed Results</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  We guarantee English fluency improvement or continue training at no cost. 
                  Our confidence guarantee sets us apart from other English courses.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <Star className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle>Malaysia&apos;s #1 Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Rated as Malaysia&apos;s top <em>English speaking course</em> by thousands of professionals. 
                  4.9/5 stars across all review platforms.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Course Curriculum */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              English Speaking Course Curriculum
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Comprehensive training modules designed to transform your English speaking abilities
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6">What You&apos;ll Master in Our English Speaking Course:</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Confident Public Speaking</h4>
                    <p className="text-gray-600 dark:text-gray-400">Overcome fear and speak English confidently in any situation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Business English Communication</h4>
                    <p className="text-gray-600 dark:text-gray-400">Master professional English for meetings, presentations, and negotiations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Pronunciation & Accent Training</h4>
                    <p className="text-gray-600 dark:text-gray-400">Perfect your English pronunciation with our specialized techniques</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Advanced Vocabulary Building</h4>
                    <p className="text-gray-600 dark:text-gray-400">Expand your English vocabulary for professional contexts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Leadership English Skills</h4>
                    <p className="text-gray-600 dark:text-gray-400">Develop executive-level English communication abilities</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                <CardHeader>
                  <CardTitle className="text-blue-700 dark:text-blue-300">Phase 1: Foundation (Month 1-2)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• English speaking confidence building</li>
                    <li>• Basic business English vocabulary</li>
                    <li>• Pronunciation fundamentals</li>
                    <li>• Overcoming speaking anxiety</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-900/20">
                <CardHeader>
                  <CardTitle className="text-green-700 dark:text-green-300">Phase 2: Development (Month 3-4)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• Advanced English conversation skills</li>
                    <li>• Professional presentation techniques</li>
                    <li>• Meeting facilitation in English</li>
                    <li>• Cross-cultural communication</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 bg-purple-50 dark:bg-purple-900/20">
                <CardHeader>
                  <CardTitle className="text-purple-700 dark:text-purple-300">Phase 3: Mastery (Month 5-6)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• Executive English communication</li>
                    <li>• Leadership speaking skills</li>
                    <li>• International business English</li>
                    <li>• Advanced negotiation techniques</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              English Speaking Course Success Stories
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Real results from real professionals who transformed their careers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 italic">
                  &quot;This English speaking course changed my life. From struggling with basic conversations 
                  to leading international meetings confidently. iCSE Malaysia is simply the best!&quot;
                </p>
                <div className="text-center">
                  <div className="font-bold">Maria Abdullah</div>
                  <div className="text-sm text-gray-500">Senior Manager, Tech Company</div>
                  <div className="text-xs text-green-600 font-medium">Result: 200% salary increase</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 italic">
                  &quot;Best English speaking course in Malaysia! The iCSE method works miracles. 
                  I went from zero confidence to presenting to 500+ people in English.&quot;
                </p>
                <div className="text-center">
                  <div className="font-bold">David Tan</div>
                  <div className="text-sm text-gray-500">Regional Director, MNC</div>
                  <div className="text-xs text-green-600 font-medium">Result: Promoted to Regional Head</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 italic">
                  &quot;Incredible transformation! This English speaking course gave me the confidence 
                  to switch careers and land my dream job. Worth every ringgit!&quot;
                </p>
                <div className="text-center">
                  <div className="font-bold">Priya Krishnan</div>
                  <div className="text-sm text-gray-500">Marketing Director, FMCG</div>
                  <div className="text-xs text-green-600 font-medium">Result: Career switch success</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Master English Speaking?
          </h2>
          <p className="text-xl mb-8">
            Join Malaysia&apos;s #1 English speaking course and transform your career today. 
            Limited seats available - secure your spot now!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button asChild size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
              <Link href="/signup/student">Enroll in English Speaking Course</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
              <Link href="/courses">View Course Packages</Link>
            </Button>
          </div>
          <p className="text-sm text-purple-200">
            ⭐ 30-day money-back guarantee | 📞 Free consultation call | 🎓 Certificate upon completion
          </p>
        </div>
      </section>
    </div>
  )
}
