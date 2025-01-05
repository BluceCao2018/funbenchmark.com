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
}: {
  children: React.ReactNode;
}) {

  return (
    <>
      {children}
    </>
  );
} 