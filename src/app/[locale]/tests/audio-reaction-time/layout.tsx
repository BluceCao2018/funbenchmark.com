import { ToolsPage } from '@/components/ToolsList';
import { Breadcrumb, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from '@/components/ui/breadcrumb';
import {getLocale, getTranslations} from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('audioReaction');
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

export default async function Layout({children}: {children: React.ReactNode}) {
  const categoryData = {
    src: "reactiontime.jsonc",
    name: "Reaction Time Test",
    description: "Test your reaction time",
    link: "reactiontime"
  };
  const categoryData2 = {
    src: "audition.jsonc",
    name: "Audition Test",
    description: "Test your audition ability",
    link: "audition"
  };

  const locale = await getLocale();
  const t = await getTranslations('navigation')
  const t2 = await getTranslations('audioReaction')
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
    <div className="container mx-auto py-16 space-y-16">
    <h2 className="text-3xl font-bold text-center mb-8 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-24 after:h-1 after:bg-blue-500 after:rounded-full">{t2("otherAudition")}</h2>
    <ToolsPage category={categoryData2} locale={locale} />

      <h2 className="text-3xl font-bold text-center mb-8 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-24 after:h-1 after:bg-blue-500 after:rounded-full">{t2("otherTests")}</h2>
        <ToolsPage category={categoryData} locale={locale} />
      </div>
    </>
  );
} 
