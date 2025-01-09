import {getTranslations, getLocale} from 'next-intl/server';
import { ToolsPage } from '@/components/ToolsList'
import { Breadcrumb, BreadcrumbLink, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export async function generateMetadata({ params }: { 
  params: { 
    locale: string 
  } 
}) {
  const t = await getTranslations('timedMessage.create');
  const w = await getTranslations('website');
  const imageSuffix = params.locale === 'zh' ? '-zh' : '';
  return {
    title: t("meta_title"),
    description: t("meta_description"),
    alternates: {
      canonical: w("domain") + "/time-limited-visibility/create"
    },
    twitter: {
      card: 'summary_large_image',
      title: t("meta_title"),
      description: t("meta_description"),
      site: '@BluceC56570',
      images: `${w("domain")}/twitter/time-limited-visibility${imageSuffix}.png`,
    },
    openGraph: {
      type: 'article',
      title: t("meta_title"),
      description: t("meta_description"),
      url: `${w("domain")}/time-limited-visibility/create`,
      images: `${w("domain")}/twitter/time-limited-visibility.png`,
    },
  };
}

export default async function TimeLimitedVisibilityCreateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
} 