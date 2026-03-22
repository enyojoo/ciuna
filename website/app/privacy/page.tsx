"use client"

import { ArrowLeft } from "lucide-react"
import { BrandLogo } from "@ciuna/shared"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"

function PrivacyPageContent() {
  const searchParams = useSearchParams()
  const [showBackButton, setShowBackButton] = useState(false)

  useEffect(() => {
    // Check if user came from an internal page
    const referrer = document.referrer
    const fromParam = searchParams.get('from')
    const fromInternal = fromParam === 'internal'
    const fromRegister = fromParam === 'register'
    
    // Show back button if:
    // 1. There's a 'from=internal' or 'from=register' query parameter
    // 2. Referrer is from the same domain (ciuna.com)
    // 3. Referrer includes auth/register path
    const isInternalReferrer = referrer && (
      referrer.includes('ciuna.com') || 
      referrer.includes('localhost') ||
      referrer.includes('127.0.0.1')
    )
    const isFromRegister = referrer && referrer.includes('/auth/register')
    
    setShowBackButton(fromInternal || fromRegister || isInternalReferrer || isFromRegister)
  }, [searchParams])

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = "/"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          {showBackButton ? (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-ciuna-primary hover:text-ciuna-primary-600 transition-colors p-0 h-auto"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </Button>
          ) : (
            <div className="w-16" /> // Spacer to keep logo centered
          )}
          <BrandLogo size="md" />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="shadow-lg border-0 ring-1 ring-gray-100">
          <CardContent className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. About This Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  This Privacy Policy describes how Cova Systems Limited (&quot;Ciuna,&quot; &quot;we,&quot;
                  &quot;us,&quot; or &quot;our&quot;) collects, uses, and shares information about you when you use our
                  platform and web applications. Ciuna provides cross-border money movement through licensed financial
                  service partners where available. Ciuna is a financial technology company and not a bank or exchange
                  and acts as a technology platform facilitating money movement services. Payment products are provided
                  in partnership with licensed institutions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Ciuna collects information you provide directly to us, such as when you create an account, use our
                  services, or contact us for support. This includes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Personal identification information (name, email address, phone number, date of birth)</li>
                  <li>Financial information (bank account details, transaction history)</li>
                  <li>Identity verification documents (government-issued ID, proof of address)</li>
                  <li>Device and usage information</li>
                  <li>Location data (for fraud prevention and regulatory compliance)</li>
                  <li>Biometric data (if required for identity verification)</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  <strong>Third-Party Partner Information:</strong> Our licensed financial service partners may also
                  collect additional information as required by their regulatory obligations.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  <strong>Third-Party KYC Verification Services:</strong> We use one or more qualified verification
                  partners to provide KYC/KYB services. When you complete identity verification, those partners may
                  collect and process your personal information, identity documents, and verification data on our
                  behalf. Where applicable they act as processors and are contractually required to protect your
                  information in accordance with applicable data protection laws. Information is shared with us for
                  account verification and regulatory compliance. Partners may collect additional information
                  including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
                  <li>Social Security Number (SSN) for U.S. residents</li>
                  <li>Employment status and occupation</li>
                  <li>Expected monthly transaction volume</li>
                  <li>Account purpose and source of funds</li>
                  <li>KYC verification status and rejection reasons (if applicable)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Provide, maintain, and improve our platform services</li>
                  <li>Process transactions through our licensed partners</li>
                  <li>Verify your identity and prevent fraud</li>
                  <li>Comply with legal and regulatory requirements (AML, KYC, sanctions screening)</li>
                  <li>Communicate with you about our services and transactions</li>
                  <li>Provide customer support</li>
                  <li>Develop and improve our early-stage platform</li>
                  <li>Share with licensed partners as necessary for service provision</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may share your information in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>With your consent or at your direction</li>
                  <li>With licensed financial service partners who facilitate transactions</li>
                  <li>With service providers who assist us in operating our business</li>
                  <li>To comply with legal obligations, court orders, or regulatory requests</li>
                  <li>To protect the rights, property, or safety of Ciuna, our users, or others</li>
                  <li>In connection with a merger, acquisition, or sale of assets</li>
                  <li>With regulatory authorities as required by financial services regulations</li>
                  <li>For fraud prevention and risk management purposes</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  <strong>Information Sharing with KYC Providers:</strong> We share your personal information and
                  identity verification documents with third-party KYC verification providers as needed to facilitate
                  identity verification and regulatory compliance. Providers process this information under their privacy
                  commitments and our contractual agreements. They may retain verification data as required by law and
                  their retention policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
                <p className="text-gray-700 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal information
                  against unauthorized access, alteration, disclosure, or destruction. However, no method of
                  transmission over the internet or electronic storage is 100% secure. We continuously enhance our
                  security measures to meet industry standards and regulatory requirements.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
                <p className="text-gray-700 leading-relaxed">
                  We retain your personal information for as long as necessary to provide our services, comply with
                  legal obligations (including financial services regulations that may require extended retention
                  periods), resolve disputes, and enforce our agreements. Retention periods may vary depending on the
                  type of information and regulatory requirements in different jurisdictions.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  <strong>Verification partner retention:</strong> Our verification partners may retain your verification
                  data in accordance with their retention policies and regulatory obligations, including after your account
                  with Ciuna is closed where required by financial services regulations. For requests about data held by
                  partners, contact us at{" "}
                  <a href="mailto:legal@ciuna.com" className="text-ciuna-primary hover:underline">
                    legal@ciuna.com
                  </a>
                  .
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Depending on your location, you may have certain rights regarding your personal information,
                  including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>The right to access your personal information</li>
                  <li>The right to correct inaccurate information</li>
                  <li>The right to delete your personal information (subject to regulatory requirements)</li>
                  <li>The right to restrict processing of your information</li>
                  <li>The right to data portability</li>
                  <li>The right to object to processing</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  <strong>Note:</strong> Some rights may be limited by regulatory requirements applicable to financial
                  services.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  <strong>Data held by verification partners:</strong> If you wish to access, correct, or delete
                  personal information processed by our verification partners, contact us at{" "}
                  <a href="mailto:legal@ciuna.com" className="text-ciuna-primary hover:underline">
                    legal@ciuna.com
                  </a>{" "}
                  and we will help coordinate requests where applicable. Partners may retain certain verification data as
                  required by law and their retention policies, including after account deletion.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking</h2>
                <p className="text-gray-700 leading-relaxed">
                  We use cookies and similar tracking technologies to collect information about your browsing activities
                  and to provide you with a personalized experience. You can control cookies through your browser
                  settings, but disabling cookies may affect the functionality of our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Transfers</h2>
                <p className="text-gray-700 leading-relaxed">
                  Your information may be transferred to and processed in countries other than your country of
                  residence. We ensure that such transfers are conducted in accordance with applicable data protection
                  laws and that appropriate safeguards are in place. Our licensed partners and verification providers
                  may also process your information in their respective jurisdictions.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  <strong>Partner processing locations:</strong> Verification partners may process and store your data
                  in jurisdictions outside your country of residence. Where required, we rely on appropriate safeguards
                  for international transfers under applicable data protection laws (including standard contractual
                  clauses or equivalent mechanisms where applicable).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our services are not intended for individuals under the age of 18. We do not knowingly collect
                  personal information from children under 18. If we become aware that we have collected personal
                  information from a child under 18, we will take steps to delete such information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Regulatory Compliance</h2>
                <p className="text-gray-700 leading-relaxed">
                  As a platform facilitating financial services, we and our licensed partners are subject to various
                  regulatory requirements including anti-money laundering (AML), know-your-customer (KYC), and sanctions
                  screening obligations. This may require us to collect, process, and retain additional information and
                  to share information with regulatory authorities. Ciuna works with licensed partners and verification
                  providers to apply verification, AML screening, and strong security practices as part of the service.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  For detailed information about our compliance procedures, please review our{" "}
                  <Link href="/kyc-policy?from=internal" className="text-ciuna-primary hover:underline">
                    KYC/KYB Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/aml-policy?from=internal" className="text-ciuna-primary hover:underline">
                    AML Policy
                  </Link>
                  .
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Bank and Partner Services</h2>
                <p className="text-gray-700 leading-relaxed">
                  Services are presented as bank and fiat-based money movement. Settlement, banking, and compliance may be
                  performed by licensed partners under applicable regulations. End users interact with traditional fiat
                  currencies through bank-based flows as offered in the product.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Service Evolution</h2>
                <p className="text-gray-700 leading-relaxed">
                  As we expand our services and enter new markets, our privacy practices may evolve to meet local
                  regulatory requirements and enhance user experience. We remain committed to maintaining the highest
                  standards of data protection across all jurisdictions where we operate.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Changes to This Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by
                  posting the new Privacy Policy on our website and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Contact Us</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about this Privacy Policy or our privacy practices, please contact us at{" "}
                  <a href="mailto:legal@ciuna.com" className="text-ciuna-primary hover:underline">
                    legal@ciuna.com
                  </a>
                  .
                </p>
              </section>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function PrivacyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <PrivacyPageContent />
    </Suspense>
  )
}
