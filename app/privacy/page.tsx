import { Plane } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Plane className="h-7 w-7 text-primary-500" />
            <span className="text-xl font-bold text-gray-900">TripReady</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="bg-white rounded-2xl p-8 shadow-sm space-y-6 text-[#1E293B]">
          <p className="text-sm text-[#64748B]">Last updated: February 1, 2026</p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p className="mb-3">When you use TripReady, we collect the following information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Your name, email address, and profile picture from Google or Apple sign-in.</li>
              <li><strong>Trip Data:</strong> Destinations, travel dates, number of travelers, checklists, expenses, activities, and flight details you enter.</li>
              <li><strong>Usage Data:</strong> How you interact with the app to improve our services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p className="mb-3">We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain the TripReady service</li>
              <li>Create and manage your trips</li>
              <li>Generate personalized checklists based on your travel details</li>
              <li>Improve and optimize our app</li>
              <li>Send important updates about your account or trips</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Data Storage & Security</h2>
            <p>Your data is stored securely using Supabase, which provides enterprise-grade security including encryption at rest and in transit. We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Third-Party Services</h2>
            <p className="mb-3">We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google Sign-In:</strong> For authentication</li>
              <li><strong>Apple Sign-In:</strong> For authentication</li>
              <li><strong>Supabase:</strong> For data storage and authentication</li>
              <li><strong>Anthropic (Claude AI):</strong> For AI-powered trip creation</li>
              <li><strong>Vercel:</strong> For app hosting</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of your data</li>
              <li><strong>Update:</strong> Correct any inaccurate information</li>
              <li><strong>Delete:</strong> Request deletion of your account and all associated data</li>
              <li><strong>Export:</strong> Download your trip data</li>
            </ul>
            <p className="mt-3">To exercise these rights, go to Settings in the app or contact us at privacy@tripready.app</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Retention</h2>
            <p>We retain your data for as long as your account is active. If you delete your account, we will delete all your personal data within 30 days, except where we are required to retain it for legal purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Children's Privacy</h2>
            <p>TripReady is designed for families, but the app is intended for use by adults. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child, please contact us immediately.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <p className="mt-2"><strong>Email:</strong> privacy@tripready.app</p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-primary-500 hover:text-primary-600 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
