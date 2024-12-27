import {getTranslations, getLocale} from 'next-intl/server';
import { ToolsPage } from '@/components/ToolsList'
import { Breadcrumb, BreadcrumbLink, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export async function generateMetadata() {
  const t = await getTranslations('reactionTime');
  const w = await getTranslations('website');
  return {
    title: t("meta_title"),
    description: t("meta_description"),
    alternates: {
      canonical: w("domain")
    },
    twitter: {
      card: 'summary_large_image',
      title: t("meta_title"),
      description: t("meta_description"),
      site: '@BluceC56570',
      images: `${w("domain")}/reactiontimetest.png`,
    },
    openGraph: {
      type: 'article',
      title: t("meta_title"),
      description: t("meta_description"),
      url: `${w("domain")}/tests/reactiontime`,
      images: `${w("domain")}/reactiontimetest.png`,
    },
  };
}

export default async function ReactionTimeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const categoryData = {
    src: "reactiontime.jsonc",
    name: "Reaction Time Test",
    description: "Test your reaction time",
    link: "reactiontime"
  };

  const locale = await getLocale();
  const t = await getTranslations('navigation')
  const t2 = await getTranslations('reactionTime')
  return (
    <>
    <div className="container mx-auto px-4 py-2">
    <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">{t('homeBtn')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/category">{t('categoryBtn')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className='capitalize'>{t2("h1")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      </div>
      {children}
      <div className="container mx-auto py-8 space-y-16">
        <ToolsPage category={categoryData} locale={locale} />
      </div>
    </>
  )
} 
