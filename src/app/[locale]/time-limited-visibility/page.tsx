'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { FaLock, FaClock, FaEye, FaShare } from 'react-icons/fa'

export default function TimeLimitedVisibilityIntro() {
  const t = useTranslations('timeLimitedVisibility')
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          {t('hero.title')}
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {t('hero.description')}
        </p>
        <Button 
          size="lg"
          className="bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200"
          onClick={() => router.push('/time-limited-visibility/create')}
        >
          {t('hero.cta')}
        </Button>
      </section>
      

      {/* Features Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <Card>
          <CardHeader>
            <FaClock className="w-8 h-8 text-blue-500 mb-2" />
            <CardTitle>{t('features.timing.title')}</CardTitle>
            <CardDescription>{t('features.timing.description')}</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader>
            <FaEye className="w-8 h-8 text-green-500 mb-2" />
            <CardTitle>{t('features.attempts.title')}</CardTitle>
            <CardDescription>{t('features.attempts.description')}</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader>
            <FaShare className="w-8 h-8 text-purple-500 mb-2" />
            <CardTitle>{t('features.sharing.title')}</CardTitle>
            <CardDescription>{t('features.sharing.description')}</CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* Use Cases */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">
          {t('useCases.title')}
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">{t('useCases.personal.title')}</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>{t('useCases.personal.case1')}</li>
              <li>{t('useCases.personal.case2')}</li>
              <li>{t('useCases.personal.case3')}</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">{t('useCases.business.title')}</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>{t('useCases.business.case1')}</li>
              <li>{t('useCases.business.case2')}</li>
              <li>{t('useCases.business.case3')}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted p-8 rounded-lg mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">
          {t('howItWorks.title')}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">1</div>
            <h3 className="font-semibold mb-2">{t('howItWorks.step1.title')}</h3>
            <p>{t('howItWorks.step1.description')}</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">2</div>
            <h3 className="font-semibold mb-2">{t('howItWorks.step2.title')}</h3>
            <p>{t('howItWorks.step2.description')}</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">3</div>
            <h3 className="font-semibold mb-2">{t('howItWorks.step3.title')}</h3>
            <p>{t('howItWorks.step3.description')}</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center">
        <h2 className="text-3xl font-bold mb-6">
          {t('cta.title')}
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {t('cta.description')}
        </p>
        <Button 
          size="lg"
          className="bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200"
          onClick={() => router.push('/time-limited-visibility/create')}
        >
          {t('cta.button')}
        </Button>
      </section>
    </div>
  )
} 