// components/Layout.tsx
import React from 'react'; // 确保导入 React
import { Navigation } from './Navigation'
import { Footer } from '@/components/Footer'
import { getCategories } from '@/lib/data';
import { getLocale } from 'next-intl/server';

export async function Layout({ 
  children, 
  params,
  searchParams
}: {
  children: React.ReactNode;
  params: { locale: string };
  searchParams: Record<string, string>
}) {
  const locale = await getLocale();
  const categories = getCategories(locale);

  // 添加调试日志
  console.log('searchParams:', searchParams);
  console.log('isIframe:', searchParams.embed === 'true');

  const isIframe = searchParams.embed === 'true'

  if (isIframe) {
    console.log('Rendering iframe mode');
    return <><main className="flex-1">{children}</main></>
  }

  console.log('Rendering full layout');
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Navigation categories={categories}/>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}