import {getTranslations} from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('cpt');
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
      images: `${w("domain")}/twitter/cpt.png`,
    },
    openGraph: {
      type: 'article',
      title: t("meta_title"),
      description: t("meta_description"),
      url: `${w("domain")}/tests/continuous-performance-test`,
      images: `${w("domain")}/twitter/cpt.png`,
    },
    pageTitle: t("h1"),
  };
}

export default function Layout({children}: {children: React.ReactNode}) {
  return children;
} 