import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plane, CheckCircle, Wallet, MapPin, Sparkles } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/trips')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="h-8 w-8 text-primary-500" />
            <span className="text-2xl font-bold text-gray-900">TripReady</span>
          </div>
          <Link
            href="/login"
            className="rounded-full bg-primary-500 px-6 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Sparkles className="h-4 w-4" />
          AI-Powered Trip Planning
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Plan your family trip<br />
          <span className="text-primary-500">with just one sentence</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Type "Thailand with 2 kids in March" and let AI create your perfect trip with smart checklists, budget tracking, and kid-friendly activities.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-full bg-primary-500 px-8 py-4 text-lg font-medium text-white hover:bg-primary-600 transition-colors shadow-lg hover:shadow-xl"
        >
          Start Planning — It's Free →
        </Link>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
          What TripReady does for you
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Checklists</h3>
            <p className="text-gray-600">
              Pre-built packing lists based on your kids' ages. Never forget the essentials again.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Wallet className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Budget Tracking</h3>
            <p className="text-gray-600">
              Track every expense, upload receipts, and see exactly where your money goes.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Kid-Friendly Activities</h3>
            <p className="text-gray-600">
              Discover and save activities perfect for your children's ages.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="bg-primary-500 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to plan stress-free?</h2>
          <p className="text-primary-100 mb-8">Join families who travel with confidence.</p>
          <Link
            href="/login"
            className="inline-block rounded-full bg-white px-8 py-4 text-lg font-medium text-primary-600 hover:bg-primary-50 transition-colors"
          >
            Get Started — It's Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500 text-sm">
        <p>© 2026 TripReady. Made for families who love to travel.</p>
      </footer>
    </div>
  )
}
