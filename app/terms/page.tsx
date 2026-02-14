import { Plane } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="bg-white rounded-2xl p-8 shadow-sm space-y-6 text-gray-600">
          <p className="text-sm text-gray-500">Last updated: February 1, 2026</p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using TripReady, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p>TripReady is a family travel planning application that helps you organize trips, manage checklists, track expenses, plan activities, and store flight information. The service includes AI-powered features to assist with trip creation.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must sign in using Google or Apple to use TripReady</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must provide accurate information when creating your account</li>
              <li>You may not use another person's account without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Upload malicious code or content</li>
              <li>Use automated systems to access the service without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. User Content</h2>
            <p>You retain ownership of all content you create in TripReady (trips, checklists, expenses, etc.). By using our service, you grant us a license to store and process your content solely for the purpose of providing the service to you.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. AI Features</h2>
            <p>TripReady uses AI to help create trips from natural language descriptions. While we strive for accuracy, AI-generated suggestions may not always be perfect. You are responsible for reviewing and verifying all trip details.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Disclaimer of Warranties</h2>
            <p>TripReady is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted, error-free, or meet your specific requirements. Travel information and suggestions are for planning purposes only.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, TripReady shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Account Deletion</h2>
            <p>You may delete your account at any time through the Settings page. Upon deletion, all your data will be permanently removed from our systems within 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to Terms</h2>
            <p>We may update these Terms of Service from time to time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contact</h2>
            <p>For questions about these Terms of Service, contact us at:</p>
            <p className="mt-2"><strong>Email:</strong> support@tripready.app</p>
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
