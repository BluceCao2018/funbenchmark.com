import {getTranslations, getLocale} from 'next-intl/server';

export async function generateMetadata({ params }: { 
  params: { 
    messageId: string,
    locale: string 
  } 
}) {
  const t = await getTranslations('timedMessage.create');
  const w = await getTranslations('website');

  // 根据 locale 决定图片后缀
  const imageSuffix = params.locale === 'zh' ? '-zh' : '';
  const imageUrl = `${w("domain")}/twitter/time-limited-visibility${imageSuffix}.png`;

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
      images: imageUrl,
    },
    openGraph: {
      type: 'article',
      title: t("meta_title"),
      description: t("meta_description"),
      url: `${w("domain")}/time-limited-visibility/create`,
      images: imageUrl,
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