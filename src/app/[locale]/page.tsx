// pages/index.js
import React, { Suspense } from 'react'; // 确保导入 React
import { getSortedPostsData } from '@/lib/posts'
import { getCategories } from '@/lib/data';
import Link from 'next/link'; // 确保导入 Link 组件

import { ToolsList } from '@/components/ToolsList';
import { ArticleList } from '@/components/ArticleList'

import { Search } from '@/components/Search';
import {getTranslations, getLocale} from 'next-intl/server';

import '@fortawesome/fontawesome-free/css/all.min.css';

export async function generateMetadata() {
  const t = await getTranslations('home');
  const w = await getTranslations('website');
  return {
    title: t("meta_title"),
    description: t("meta_description"),
    alternates: {
      canonical: w("domain")
    }
  };
}


type categoryType = { 
  name: string; 
  src: string; 
  description: string;
  link: string; 
}


export default async function Home() {
  const locale = await getLocale();
  const t = await getTranslations('home');
  // categories data
  const categories = getCategories(locale);
  console.log('categories: ', categories)

  const sortedPosts = await getSortedPostsData("article")
  const allPostsData = sortedPosts.slice(0, 6)
  
  // deployment

  return (
    <div className="w-full mx-auto py-0 space-y-16 ">
        <div className="banner w-full h-[550px] flex flex-col justify-center items-center bg-blue-theme">
        <i className="fas fa-bolt text-9xl text-white mb-8 animate-fade"></i>
          <h1 className="text-4xl font-bold text-center mb-4 text-white">{t("h2")}</h1>
          <p className="text-lg text-center mb-20 text-white">{t("description")}</p>
          <Link href="/tests/reactiontime">
            <button className='bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-yellow-700 transition-colors'>Get Started</button>
          </Link>
        </div>
        {/* <div className='w-full px-2 pt-10 lg:w-1/2'>
          <Search />
        </div> */}
      <div className="container mx-auto py-0 space-y-16 ">
      {categories.map((category: categoryType, index: React.Key | null | undefined) => (
        <ToolsList key={index} category={category} locale={locale} />
      ))}
      </div>
    </div>
  )
}