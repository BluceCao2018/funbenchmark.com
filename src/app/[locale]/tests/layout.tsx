import {getTranslations, getLocale} from 'next-intl/server';
import { getCategories } from '@/lib/data';
import { ToolsList } from '@/components/ToolsList';

export async function generateMetadata() {
  const t = await getTranslations('website');
  return {
    alternates: {
      canonical: t("domain")
    },
  };
}

export default async function TestsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = await getLocale();
  const categories = getCategories(locale);

  return (
    <>
      {children}
      {/* <div className="container mx-auto py-8 space-y-16">
        {categories.map((category: {
          name: string;
          src: string;
          description: string;
          link: string;
        }, index: number) => (
          <ToolsList key={index} category={category} locale={locale} />
        ))}
      </div> */}
    </>
  );
} 