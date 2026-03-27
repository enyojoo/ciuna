/**
 * Central SEO copy for the web app. Edit here to keep meta, Open Graph, Twitter,
 * and JSON-LD aligned.
 */

export const SEO_SITE_NAME = "Ciuna"

/** Primary window title + default for Open Graph / Twitter when no template applies */
export const SEO_DEFAULT_TITLE = "Ciuna Web App"

/**
 * Meta description (≈150–160 chars ideal for SERPs; longer is OK for OG).
 */
export const SEO_DEFAULT_DESCRIPTION =
  "Send money across borders with transparent pricing and bank-grade security. Instant transfers, KYC-ready onboarding, and coverage across supported corridors—for individuals and businesses."

export const SEO_KEYWORDS = [
  "international money transfer",
  "cross-border payments",
  "global remittance",
  "bank transfer",
  "instant transfer",
  "zero fee transfer",
  "US EU payments",
  "Africa money transfer",
  "Nigeria Ghana Kenya",
  "KYC AML compliance",
  "money transfer API",
  "fintech",
  "business payments",
].join(", ")

export const SEO_OG_IMAGE_URL =
  "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/ciuna%20seo%20cover.png"

export const SEO_OG_IMAGE_ALT = "Ciuna — send money globally"

/** Referral link previews (Open Graph / Twitter / native share title) */
export const SEO_REFERRAL_SHARE_TITLE = "Send Money with Ciuna"

/** Referral link previews — matches in-app share copy (OG description; colon before URL in shareMessage) */
export const SEO_REFERRAL_SHARE_DESCRIPTION =
  "Use my link to sign up and send money to 10+ countries for free on Ciuna:"

/**
 * Image shown when a referral URL is shared (Slack, iMessage, etc.).
 * Override this URL to use a dedicated referral asset; defaults to the main OG image.
 */
export const SEO_REFERRAL_SHARE_IMAGE_URL = SEO_OG_IMAGE_URL

export const SEO_REFERRAL_SHARE_IMAGE_ALT = "Ciuna — send money to 10+ countries"

/** Canonical site origin (metadata, sitemap, structured data) */
export const SEO_SITE_URL = "https://app.ciuna.com"

/** PWA install / manifest (keep short) */
export const SEO_MANIFEST_DESCRIPTION =
  "Send money across borders—instant transfers and secure onboarding with Ciuna."

export const SEO_TWITTER_CREATOR = "@ciuna"

/** Suffix for nested route titles (root default is `SEO_DEFAULT_TITLE` without template) */
const PAGE_TITLE_SUFFIX = " - Ciuna"

/** Page-specific document titles (full string incl. suffix; root has no template) */
export const SEO_PAGE_TITLES = {
  dashboard: `Dashboard${PAGE_TITLE_SUFFIX}`,
  send: `Send money${PAGE_TITLE_SUFFIX}`,
  transactions: `Transactions${PAGE_TITLE_SUFFIX}`,
  recipients: `Recipients${PAGE_TITLE_SUFFIX}`,
  support: `Support${PAGE_TITLE_SUFFIX}`,
  auth: `Sign in${PAGE_TITLE_SUFFIX}`,
  register: `Create account${PAGE_TITLE_SUFFIX}`,
  forgotPassword: `Forgot password${PAGE_TITLE_SUFFIX}`,
  resetPassword: `Reset password${PAGE_TITLE_SUFFIX}`,
  morePassword: `Password${PAGE_TITLE_SUFFIX}`,
  moreNotifications: `Notifications${PAGE_TITLE_SUFFIX}`,
  moreVerificationIdentity: `Identity verification${PAGE_TITLE_SUFFIX}`,
  moreVerificationAddress: `Address verification${PAGE_TITLE_SUFFIX}`,
  moreReferrals: `Affiliates & referrals${PAGE_TITLE_SUFFIX}`,
} as const

/** Page-specific meta descriptions (logged-in / utility routes; many are noindex) */
export const SEO_PAGE_DESCRIPTIONS = {
  dashboard:
    "Your Ciuna home: balances, recent transfers, and quick actions—securely in one place.",
  send: "Send money internationally with Ciuna—real-time rates, tracked transfers, and support for your recipients.",
  transactions: "Review transfer history, statuses, and details for every payment you’ve sent with Ciuna.",
  recipients: "Save and manage recipients for faster, repeatable international transfers.",
  support: "Get help with transfers, verification, and your Ciuna account.",
  auth: "Sign in to Ciuna to send money globally with transparent pricing and secure authentication.",
  register:
    "Create your Ciuna account to send money to 10+ countries with transparent pricing and secure onboarding.",
  forgotPassword: "Start a secure password reset for your Ciuna account.",
  resetPassword: "Choose a new password to get back into your Ciuna account.",
  morePassword: "Update your Ciuna account password and keep your sign-in secure.",
  moreNotifications: "Choose how Ciuna notifies you about transfers, security, and account updates.",
  moreVerificationIdentity:
    "Complete identity verification for your Ciuna account—secure uploads and guided steps.",
  moreVerificationAddress:
    "Confirm your address for Ciuna verification—support for proof of residence where required.",
  moreReferrals:
    "Share your referral link, track rewards when friends send with Ciuna, and request payouts to your saved recipients.",
} as const

/** JSON-LD: FinancialService block */
export const SEO_FINANCIAL_SERVICE_DESCRIPTION =
  "Cross-border money transfer platform for individuals and businesses—instant transfers, transparent FX, and compliance-ready onboarding."

export const SEO_FINANCIAL_SERVICE_URL = SEO_SITE_URL

/** FAQPage JSON-LD (schema.org) */
export const SEO_FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much does it cost to send money with Ciuna?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ciuna charges no transfer fees—you pay the real-time exchange rate with no hidden markup, so you can save compared with many traditional remittance services.",
      },
    },
    {
      "@type": "Question",
      name: "How fast are international money transfers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Transfers use real-time settlement where supported. Many payments reach the recipient’s bank in minutes instead of several business days.",
      },
    },
    {
      "@type": "Question",
      name: "Which countries can I send money to?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Supported corridors include Nigeria, Ghana, Kenya, Uganda, and South Africa, with more regions added over time.",
      },
    },
    {
      "@type": "Question",
      name: "Is it safe to send money with Ciuna?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Transfers are encrypted and processed through regulated partners. Security and compliance are built into the product.",
      },
    },
    {
      "@type": "Question",
      name: "How does Ciuna compare to Wise, Remitly, or WorldRemit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ciuna focuses on transparent pricing and instant delivery on supported routes. Compare total cost—including FX and fees—for your corridor before you send.",
      },
    },
  ],
} as const

/** Brand mark (OG / JSON-LD); in-app marketing surfaces */
export const SEO_LOGO_URL =
  "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Ciuna%20web%20app.png"

/** HTML emails: full-color mark on light backgrounds */
export const SEO_EMAIL_LOGO_LIGHT_URL =
  "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Ciuna%20main.png"

/** HTML emails: mark for dark-mode mail clients (prefers-color-scheme: dark) */
export const SEO_EMAIL_LOGO_DARK_URL =
  "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Ciuna%20light.png"

/** FinancialService JSON-LD (schema.org) */
export const SEO_FINANCIAL_SERVICE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  name: SEO_SITE_NAME,
  description: SEO_FINANCIAL_SERVICE_DESCRIPTION,
  url: SEO_FINANCIAL_SERVICE_URL,
  logo: SEO_LOGO_URL,
  serviceType: "Money Transfer",
  areaServed: [
    { "@type": "Country", name: "Nigeria" },
    { "@type": "Country", name: "Ghana" },
    { "@type": "Country", name: "Kenya" },
    { "@type": "Country", name: "Uganda" },
    { "@type": "Country", name: "South Africa" },
    { "@type": "Country", name: "European Union" },
  ],
  feesAndCommissionsSpecification: {
    "@type": "UnitPriceSpecification",
    price: "0",
    priceCurrency: "USD",
    description: "No Ciuna transfer fees—pay the live exchange rate only.",
  },
  offers: {
    "@type": "Offer",
    description: "International bank-to-bank transfers with transparent pricing on supported corridors.",
    price: "0",
    priceCurrency: "USD",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Money transfer services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Send money to Nigeria",
          description: "International transfer to Nigeria",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Send money to Ghana",
          description: "International transfer to Ghana",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Send money to Kenya",
          description: "International transfer to Kenya",
        },
      },
    ],
  },
} as const
