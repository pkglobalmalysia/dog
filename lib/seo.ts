// SEO Configuration and Utilities
import type { Metadata } from 'next'

export const siteConfig = {
  name: "iCSE Malaysia - i Can Speak English",
  title: "Learn English in Malaysia | iCSE English Speaking Course | #1 English Training",
  description: "Master English speaking with iCSE Malaysia's proven coaching program. Top-rated English course in Malaysia for professionals. Join 10,000+ confident speakers. Guaranteed results!",
  url: "https://pkibs.com",
  ogImage: "/og-image.jpg",
  links: {
    facebook: "https://facebook.com/icse-malaysia",
    twitter: "https://twitter.com/icse_malaysia", 
    instagram: "https://instagram.com/icse_malaysia",
    linkedin: "https://linkedin.com/company/icse-malaysia"
  },
  keywords: [
    "learn english malaysia",
    "english speaking course malaysia", 
    "iCSE malaysia",
    "i can speak english",
    "english coaching malaysia",
    "english training malaysia",
    "speak english confidently",
    "professional english course",
    "business english malaysia",
    "english communication skills",
    "english conversation class",
    "english language center malaysia",
    "improve english speaking",
    "english fluency course",
    "corporate english training"
  ]
}

export function generateSEOMetadata({
  title,
  description,
  image,
  url,
  keywords,
  type = 'website'
}: {
  title?: string
  description?: string
  image?: string
  url?: string
  keywords?: string[]
  type?: 'website' | 'article'
}): Metadata {
  const seoTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title
  const seoDescription = description || siteConfig.description
  const seoImage = image || siteConfig.ogImage
  const seoUrl = url || siteConfig.url
  const seoKeywords = keywords ? [...siteConfig.keywords, ...keywords] : siteConfig.keywords

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords.join(', '),
    authors: [{ name: 'iCSE Malaysia Team' }],
    creator: 'iCSE Malaysia',
    publisher: 'Strength Management & Trading Sdn. Bhd.',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: type,
      locale: 'en_MY',
      url: seoUrl,
      title: seoTitle,
      description: seoDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: seoImage,
          width: 1200,
          height: 630,
          alt: seoTitle,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: [seoImage],
      creator: '@icse_malaysia',
    },
    verification: {
      google: 'google-verification-code', // Add your Google Search Console verification
      yandex: 'yandex-verification-code',
      yahoo: 'yahoo-verification-code',
    },
    alternates: {
      canonical: seoUrl,
      languages: {
        'en-MY': seoUrl,
        'ms-MY': `${seoUrl}/ms`,
      }
    },
    category: 'Education',
  }
}

export const jsonLd = {
  organization: {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "iCSE Malaysia - i Can Speak English",
    "alternateName": "Strength Management & Trading Sdn. Bhd.",
    "url": siteConfig.url,
    "logo": `${siteConfig.url}/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+60-12-345-6789", // Replace with actual number
      "contactType": "customer service",
      "areaServed": "MY",
      "availableLanguage": ["English", "Malay"]
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Your Street Address", // Replace with actual address
      "addressLocality": "Kuala Lumpur",
      "addressRegion": "Federal Territory",
      "postalCode": "50000",
      "addressCountry": "MY"
    },
    "sameAs": [
      siteConfig.links.facebook,
      siteConfig.links.twitter,
      siteConfig.links.instagram,
      siteConfig.links.linkedin
    ]
  },
  
  course: {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "i Can Speak English (iCSE) Coaching Program",
    "description": "Comprehensive English speaking course designed for Malaysian professionals to achieve 100% confidence in English communication",
    "provider": {
      "@type": "EducationalOrganization",
      "name": "iCSE Malaysia",
      "url": siteConfig.url
    },
    "courseMode": ["online", "in-person"],
    "educationalLevel": "Intermediate to Advanced",
    "teaches": [
      "English Speaking",
      "Business Communication",
      "Presentation Skills",
      "Conversation Fluency",
      "Professional English"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "1250",
      "bestRating": "5"
    }
  },

  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteConfig.name,
    "url": siteConfig.url,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteConfig.url}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }
}
