import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users, Shield, Star, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FH</span>
            </div>
            <span className="text-xl font-bold text-gray-900">FreelanceHub</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-4">
          Trusted by 10,000+ professionals
        </Badge>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 text-balance">
          Connect with Top Freelancers
          <span className="text-blue-600"> Worldwide</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto text-pretty">
          Find skilled professionals for your projects or showcase your expertise to clients. Secure payments, real-time
          messaging, and trusted reviews.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup">
            <Button size="lg" className="text-lg px-8">
              Start Hiring <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
              Find Work
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose FreelanceHub?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage freelance projects successfully
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Secure Payments</CardTitle>
              <CardDescription>
                Escrow system protects both clients and freelancers with secure payment processing
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Real-time Messaging</CardTitle>
              <CardDescription>
                Communicate instantly with clients and freelancers through our built-in messaging system
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Trusted Reviews</CardTitle>
              <CardDescription>
                Build your reputation with authentic reviews and ratings from completed projects
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Get started in just a few simple steps</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* For Clients */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">For Clients</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Post Your Project</h4>
                    <p className="text-gray-600">Describe your project and set your budget</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Review Proposals</h4>
                    <p className="text-gray-600">Get proposals from qualified freelancers</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Hire & Pay Securely</h4>
                    <p className="text-gray-600">Work together with secure escrow payments</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Freelancers */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">For Freelancers</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Create Your Profile</h4>
                    <p className="text-gray-600">Showcase your skills and experience</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Find Projects</h4>
                    <p className="text-gray-600">Browse and apply to relevant projects</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Get Paid</h4>
                    <p className="text-gray-600">Complete work and receive secure payments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of clients and freelancers who trust FreelanceHub for their projects
        </p>
        <Link href="/auth/signup">
          <Button size="lg" className="text-lg px-8">
            Create Your Account <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FH</span>
            </div>
            <span className="text-xl font-bold">FreelanceHub</span>
          </div>
          <div className="text-center text-gray-400">
            <p>&copy; 2024 FreelanceHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
